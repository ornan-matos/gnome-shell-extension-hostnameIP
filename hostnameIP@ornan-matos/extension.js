'use strict';

const { St, Gio, GLib, GObject, Clutter } = imports.gi;
const Main = imports.ui.main;
const ExtensionUtils = imports.misc.extensionUtils;

let hostnameLabel, ipLabel;
let settings;

const HostnameIPExtension = class HostnameIPExtension {
    enable() {
        settings = ExtensionUtils.getSettings(
            'org.gnome.shell.extensions.hostnameIP'
        );

        // Obter hostname
        const [okHost, hostname] = GLib.hostname_get();
        const ip = this._getLocalIP();

        // Criar labels
        hostnameLabel = new St.Label({
            text: hostname || 'Unknown Host',
            style_class: 'label-1',
        });

        ipLabel = new St.Label({
            text: ip || '0.0.0.0',
            style_class: 'label-2',
        });

        this._applyStyle();

        // Adicionar ao stage
        Main.layoutManager.addChrome(hostnameLabel);
        Main.layoutManager.addChrome(ipLabel);

        this._updatePosition();

        // Reagir a mudanças de configuração
        this._changedIds = [
            settings.connect('changed::l2-vertical', () => this._updatePosition()),
            settings.connect('changed::l2-horizontal', () => this._updatePosition()),
            settings.connect('changed::opacity', () => this._applyStyle()),
            settings.connect('changed::size-l1', () => this._applyStyle()),
            settings.connect('changed::size-l2', () => this._applyStyle()),
        ];
    }

    disable() {
        if (hostnameLabel) hostnameLabel.destroy();
        if (ipLabel) ipLabel.destroy();
        hostnameLabel = null;
        ipLabel = null;

        if (this._changedIds) {
            this._changedIds.forEach(id => settings.disconnect(id));
            this._changedIds = null;
        }

        settings = null;
    }

    _applyStyle() {
        const opacity = settings.get_int('opacity');
        const sizeL1 = settings.get_int('size-l1');
        const sizeL2 = settings.get_int('size-l2');

        hostnameLabel.set_style(`font-size: ${sizeL1}px; opacity: ${opacity / 255};`);
        ipLabel.set_style(`font-size: ${sizeL2}px; opacity: ${opacity / 255};`);
    }

    _updatePosition() {
        const vert = settings.get_double('l2-vertical');
        const horiz = settings.get_double('l2-horizontal');

        const monitor = Main.layoutManager.primaryMonitor;
        const x = monitor.x + monitor.width * horiz;
        const y = monitor.y + monitor.height * vert;

        // Ajuste para que o label2 (IP) fique em y, e o label1 (hostname) fique acima dele.
        // O valor 40 estava fixo, é melhor usar a altura do próprio label.
        const l1Height = hostnameLabel.get_height() > 0 ? hostnameLabel.get_height() : 40;

        hostnameLabel.set_position(x, y - l1Height);
        ipLabel.set_position(x, y);
    }

    //
    // --- FUNÇÃO CORRIGIDA ---
    //
    _getLocalIP() {
        try {
            const monitor = Gio.NetworkMonitor.get_default();
            const interfaces = monitor.get_network_interfaces();

            for (const iface of interfaces) {
                const addresses = iface.get_addresses();
                for (const addr of addresses) {
                    // Usar apenas IPv4, não-loopback e não-linklocal
                    if (addr.get_family() === Gio.SocketFamily.IPV4 &&
                        !addr.is_loopback() &&
                        !addr.is_link_local()) {

                        // Retorna o primeiro IP válido encontrado
                        return addr.to_string();
                    }
                }
            }
        } catch (e) {
            logError(e, 'Falha ao buscar IP local com Gio.NetworkMonitor');
        }
        // Fallback caso não encontre
        return null;
    }
};

function init() {
    return new HostnameIPExtension();
}
