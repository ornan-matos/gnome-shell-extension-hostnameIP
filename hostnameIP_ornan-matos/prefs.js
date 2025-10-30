import Gio from 'gi://Gio'
import Gtk from 'gi://Gtk'
import Adw from 'gi://Adw'

import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js'

export default class ActivateGnomeExtensionPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const page = new Adw.PreferencesPage()
        window.add(page)

        const group = new Adw.PreferencesGroup()
        page.add(group)

        this.settings = this.getSettings()

        let prefsWidget = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            halign: Gtk.Align.CENTER,
            spacing: 6,
            margin_top: 12,
            margin_bottom: 12,
            margin_start: 6,
            margin_end: 6,
        })

        // line 2 vertical position
        let label_line_2_vertical_position = new Gtk.Label({
            label: '<b>Vertical Position</b>',
            margin_top: 12,
            use_markup: true,
        })
        prefsWidget.append(label_line_2_vertical_position)

        let scale_line_2_vertical_position = new Gtk.Scale({
            adjustment: new Gtk.Adjustment({lower: 0.01, upper: 1.0, step_increment: 0.01, page_increment: 0.1}),
            margin_top: 6,
            draw_value: false,
            digits: 4,
        })
        prefsWidget.append(scale_line_2_vertical_position)

        // line 2 horizontal position
        let label_line_2_horizontal_position = new Gtk.Label({
            label: '<b>Horizontal Position</b>',
            margin_top: 6,
            use_markup: true,
        })
        prefsWidget.append(label_line_2_horizontal_position)

        let scale_line_2_horizontal_position = new Gtk.Scale({
            adjustment: new Gtk.Adjustment({lower: 0.01, upper: 1.0, step_increment: 0.01, page_increment: 0.1}),
            margin_top: 6,
            draw_value: false,
            digits: 4,
        })
        prefsWidget.append(scale_line_2_horizontal_position)

        // line 1 text size
        let label_line_1_text_size = new Gtk.Label({
            label: '<b>Line 1 Text Size</b>',
            margin_top: 12,
            use_markup: true,
        })
        prefsWidget.append(label_line_1_text_size)

        let spinbutton_line_1_text_size = new Gtk.SpinButton({
            adjustment: new Gtk.Adjustment({lower: 1.0, upper: 65535.0, step_increment: 1.0, page_increment: 10.0}),
            margin_top: 6,
            numeric: true,
            digits: 1,
        })
        prefsWidget.append(spinbutton_line_1_text_size)

        // line 2 text size
        let label_line_2_text_size = new Gtk.Label({
            label: '<b>Line 2 Text Size</b>',
            margin_top: 6,
            use_markup: true,
        })
        prefsWidget.append(label_line_2_text_size)

        let spinbutton_line_2_text_size = new Gtk.SpinButton({
            adjustment: new Gtk.Adjustment({lower: 1.0, upper: 65535.0, step_increment: 1.0, page_increment: 10.0}),
            margin_top: 6,
            numeric: true,
            digits: 1,
        })
        prefsWidget.append(spinbutton_line_2_text_size)

        // opacity
        let label_opacity = new Gtk.Label({
            label: '<b>Opacity</b>',
            margin_top: 6,
            use_markup: true,
        })
        prefsWidget.append(label_opacity)

        let scale_opacity = new Gtk.Scale({
            adjustment: new Gtk.Adjustment({lower: 0.1, upper: 255, step_increment: 0.1, page_increment: 1}),
            margin_top: 6,
            draw_value: false,
            digits: 1,
        })
        prefsWidget.append(scale_opacity)

        let button_reset = new Gtk.Button({
            label: 'reset',
            margin_top: 12,
            margin_bottom: 6,
        })
        button_reset.connect('clicked', () => {
            this.settings.reset('l2-vertical')
            this.settings.reset('l2-horizontal')
            this.settings.reset('size-l1')
            this.settings.reset('size-l2')
            this.settings.reset('opacity')
        })
        prefsWidget.append(button_reset)

        this.settings.bind('l2-vertical', scale_line_2_vertical_position.adjustment, 'value', Gio.SettingsBindFlags.DEFAULT)
        this.settings.bind('l2-horizontal', scale_line_2_horizontal_position.adjustment, 'value', Gio.SettingsBindFlags.DEFAULT)
        this.settings.bind('size-l1', spinbutton_line_1_text_size.adjustment, 'value', Gio.SettingsBindFlags.DEFAULT)
        this.settings.bind('size-l2', spinbutton_line_2_text_size.adjustment, 'value', Gio.SettingsBindFlags.DEFAULT)
        this.settings.bind('opacity', scale_opacity.adjustment, 'value', Gio.SettingsBindFlags.DEFAULT)

        group.add(prefsWidget);
    }
}