'use strict';

import St from 'gi://St';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

export default class HostnameIPExtension extends Extension {
    enable() {
        // GSettings da extensão (usa settings-schema do metadata.json)
        this._settings = this.getSettings();

        const hostname = GLib.get_host_name() ?? 'Unknown host';
        const ip = this._getLocalIP() ?? '0.0.0.0';

        // Labels com as classes do stylesheet.css
        this._hostnameLabel = new St.Label({
            text: hostname,
            style_class: 'label-1',
        });

        this._ipLabel = new St.Label({
            text: ip,
            style_class: 'label-2',
        });

        // Adiciona na tela
        Main.layoutManager.addChrome(this._hostnameLabel);
        Main.layoutManager.addChrome(this._ipLabel);

        // Estilo inicial + posição
        this._applyStyle();
        this._updatePosition();

        // Sinais de mudança nas configs
        this._signals = [
            this._settings.connect(
                'changed::l2-vertical',
                () => this._updatePosition()
            ),
            this._settings.connect(
                'changed::l2-horizontal',
                () => this._updatePosition()
            ),
            this._settings.connect(
                'changed::opacity',
                () => this._applyStyle()
            ),
            this._settings.connect(
                'changed::size-l1',
                () => this._applyStyle()
            ),
            this._settings.connect(
                'changed::size-l2',
                () => this._applyStyle()
            ),
        ];
    }

    disable() {
        if (this._settings && this._signals) {
            for (const id of this._signals) {
                this._settings.disconnect(id);
            }
            this._signals = null;
        }

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

        const opacity = this._settings.get_int('opacity'); // 0–255
        const sizeL1 = this._settings.get_int('size-l1');
        const sizeL2 = this._settings.get_int('size-l2');

        const opacityFloat = Math.max(0, Math.min(1, opacity / 255));

        this._hostnameLabel.set_style(
            `font-size: ${sizeL1}px; opacity: ${opacityFloat};`
        );
        this._ipLabel.set_style(
            `font-size: ${sizeL2}px; opacity: ${opacityFloat};`
        );
    }

    _updatePosition() {
        if (!this._settings || !this._hostnameLabel || !this._ipLabel)
            return;

        const vert = this._settings.get_double('l2-vertical');     // 0.0–1.0
        const horiz = this._settings.get_double('l2-horizontal'); // 0.0–1.0

        const monitor = Main.layoutManager.primaryMonitor;
        const x = monitor.x + monitor.width * horiz;
        const y = monitor.y + monitor.height * vert;

        const l1Height = this._hostnameLabel.height || 40;

        this._hostnameLabel.set_position(x, y - l1Height);
        this._ipLabel.set_position(x, y);
    }

    _getLocalIP() {
        try {
            const monitor = Gio.NetworkMonitor.get_default();
            const interfaces = monitor.get_network_interfaces?.();
            if (!interfaces)
                return null;

            for (const iface of interfaces) {
                const addresses = iface.get_addresses?.();
                if (!addresses)
                    continue;

                for (const addr of addresses) {
                    if (addr.get_family() === Gio.SocketFamily.IPV4 &&
                        !addr.is_loopback() &&
                        !addr.is_link_local()) {
                        return addr.to_string();
                    }
                }
            }
        } catch (e) {
            logError(e, 'Falha ao buscar IP local');
        }

        return null;
    }
}

