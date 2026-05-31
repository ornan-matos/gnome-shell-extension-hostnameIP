'use strict';

import St from 'gi://St';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

export default class HostnameIPExtension extends Extension {
    enable() {
        // GSettings da extensão (usa "settings-schema" do metadata.json)
        this._settings = this.getSettings();

        // Cancellable para abortar operações assíncronas no disable()
        this._cancellable = new Gio.Cancellable();

        const hostname = GLib.get_host_name() ?? 'Unknown host';

        // Labels com classes definidas no stylesheet.css
        this._hostnameLabel = new St.Label({
            text: hostname,
            style_class: 'label-1',
        });

        // IP inicial provisório; será preenchido de forma assíncrona
        this._ipLabel = new St.Label({
            text: '0.0.0.0',
            style_class: 'label-2',
        });

        // Adiciona no stage
        Main.layoutManager.addChrome(this._hostnameLabel);
        Main.layoutManager.addChrome(this._ipLabel);

        // Estilo inicial e posição inicial
        this._applyStyle();
        this._updatePosition();

        // Obtém o IP local de forma assíncrona (não congela o shell)
        this._updateIP();

        // Sinais de mudança nas configurações
        this._signals = [
            this._settings.connect(
                'changed::l2-vertical',
                () => this._updatePosition(),
            ),
            this._settings.connect(
                'changed::l2-horizontal',
                () => this._updatePosition(),
            ),
            this._settings.connect(
                'changed::opacity',
                () => this._applyStyle(),
            ),
            this._settings.connect(
                'changed::size-l1',
                () => this._applyStyle(),
            ),
            this._settings.connect(
                'changed::size-l2',
                () => this._applyStyle(),
            ),
        ];
    }

    disable() {
        // Aborta operações assíncronas pendentes
        if (this._cancellable) {
            this._cancellable.cancel();
            this._cancellable = null;
        }

        // Desconecta sinais
        if (this._settings && this._signals) {
            for (const id of this._signals) {
                this._settings.disconnect(id);
            }
            this._signals = null;
        }

        // Remove labels da tela
        if (this._hostnameLabel) {
            this._hostnameLabel.destroy();
            this._hostnameLabel = null;
        }

        if (this._ipLabel) {
            this._ipLabel.destroy();
            this._ipLabel = null;
        }

        this._settings = null;
    }

    _applyStyle() {
        if (!this._settings || !this._hostnameLabel || !this._ipLabel)
            return;

        // Lê valores de GSettings
        let opacity = this._settings.get_int('opacity'); // 0–255
        const sizeL1 = this._settings.get_int('size-l1');
        const sizeL2 = this._settings.get_int('size-l2');

        // Garante faixa válida
        opacity = Math.max(0, Math.min(255, opacity));

        // Opacidade nativa do ator (0–255)
        this._hostnameLabel.set_opacity(opacity);
        this._ipLabel.set_opacity(opacity);

        // Tamanho de fonte via CSS inline
        this._hostnameLabel.set_style(`font-size: ${sizeL1}px;`);
        this._ipLabel.set_style(`font-size: ${sizeL2}px;`);
    }

    _updatePosition() {
        if (!this._settings || !this._hostnameLabel || !this._ipLabel)
            return;

        const vert = this._settings.get_double('l2-vertical');    // 0.0–1.0
        const horiz = this._settings.get_double('l2-horizontal'); // 0.0–1.0

        const monitor = Main.layoutManager.primaryMonitor;
        const x = monitor.x + monitor.width * horiz;
        const y = monitor.y + monitor.height * vert;

        const l1Height = this._hostnameLabel.height || 40;

        this._hostnameLabel.set_position(x, y - l1Height);
        this._ipLabel.set_position(x, y);
    }

    _updateIP() {
        // 1) Tenta resolver o hostname via DNS de forma assíncrona
        const hostname = GLib.get_host_name();
        const resolver = Gio.Resolver.get_default();

        resolver.lookup_by_name_async(
            hostname,
            this._cancellable,
            (res, result) => {
                try {
                    const addresses = res.lookup_by_name_finish(result);
                    const ipv4 = addresses.find(
                        addr => addr.get_family() === Gio.SocketFamily.IPV4);

                    if (ipv4) {
                        this._setIP(ipv4.to_string());
                        return;
                    }
                } catch (e) {
                    if (e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED))
                        return;
                    logError(e, 'Falha ao obter IP via Gio.Resolver');
                }

                // 2) Fallback: "hostname -I" em subprocesso assíncrono
                this._spawnHostnameIP();
            },
        );
    }

    _spawnHostnameIP() {
        let proc;
        try {
            proc = Gio.Subprocess.new(
                ['hostname', '-I'],
                Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE,
            );
        } catch (e) {
            logError(e, 'Falha ao iniciar hostname -I');
            return;
        }

        proc.communicate_utf8_async(null, this._cancellable, (p, result) => {
            try {
                const [, stdout] = p.communicate_utf8_finish(result);

                // Exemplo: "192.168.1.157 172.17.0.1 ..."
                const ips = (stdout ?? '')
                    .trim()
                    .split(/\s+/)
                    .filter(ip => /^\d+\.\d+\.\d+\.\d+$/.test(ip));

                if (ips.length > 0)
                    this._setIP(ips[0]);
            } catch (e) {
                if (e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED))
                    return;
                logError(e, 'Falha ao obter IP com hostname -I');
            }
        });
    }

    _setIP(ip) {
        if (!this._ipLabel)
            return;

        this._ipLabel.set_text(ip);

        // A largura do texto pode ter mudado; reposiciona
        this._updatePosition();
    }
}

