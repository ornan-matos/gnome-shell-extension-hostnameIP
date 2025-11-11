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

        const hostname = GLib.get_host_name() ?? 'Unknown host';
        const ip = this._getLocalIP() ?? '0.0.0.0';

        // Labels com classes definidas no stylesheet.css
        this._hostnameLabel = new St.Label({
            text: hostname,
            style_class: 'label-1',
        });

        this._ipLabel = new St.Label({
            text: ip,
            style_class: 'label-2',
        });

        // Adiciona no stage
        Main.layoutManager.addChrome(this._hostnameLabel);
        Main.layoutManager.addChrome(this._ipLabel);

        // Estilo inicial e posição inicial
        this._applyStyle();
        this._updatePosition();

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

    _getLocalIP() {
        // 1) Tenta resolver o hostname via Gio.Resolver
        try {
            const hostname = GLib.get_host_name();
            const resolver = Gio.Resolver.get_default();
            const addresses = resolver.lookup_by_name(hostname, null);

            for (const addr of addresses) {
                if (addr.get_family() === Gio.SocketFamily.IPV4) {
                    return addr.to_string();
                }
            }
        } catch (e) {
            logError(e, 'Falha ao obter IP via Gio.Resolver');
        }

        // 2) Fallback: usar `hostname -I` e converter com imports.byteArray
        try {
            const [ok, out, err, status] =
                GLib.spawn_command_line_sync('hostname -I');

            if (!ok || status !== 0 || !out)
                return null;

            // out é um ByteArray / GLib.Bytes → converte para string
            const ByteArray = imports.byteArray;
            const stdout = ByteArray.toString(out).trim();

// hostn

