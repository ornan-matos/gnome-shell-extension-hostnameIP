'use strict';

// Importações de bibliotecas
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';

// Importar utilitários da extensão
import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

// Definir a classe de Preferências principal
export default class HostnameIPPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        // Obter as configurações da extensão
        const settings = this.getSettings();

        // Criar página principal
        const page = new Adw.PreferencesPage();
        window.add(page);

        // --- Seção de Posição ---
        const positionGroup = new Adw.PreferencesGroup({
            title: 'Posição do texto',
            description: 'Ajuste a posição da segunda linha (hostname/IP).',
        });
        page.add(positionGroup);

        // Slider Vertical (linha 2)
        const sliderVertical = new Gtk.Scale({
            orientation: Gtk.Orientation.HORIZONTAL,
            adjustment: new Gtk.Adjustment({
                lower: 0.0,
                upper: 1.0,
                step_increment: 0.01,
                page_increment: 0.1,
                value: settings.get_double('l2-vertical'),
            }),
            digits: 2,
            hexpand: true,
        });
        // Conectar o slider ao GSettings
        settings.bind(
            'l2-vertical',
            sliderVertical.get_adjustment(),
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );

        const rowVertical = new Adw.ActionRow({
            title: 'Posição vertical (linha 2)',
            activatable_widget: sliderVertical,
        });
        rowVertical.add_suffix(sliderVertical);
        rowVertical.set_activatable_widget(sliderVertical);
        positionGroup.add(rowVertical);

        // Slider Horizontal (linha 2)
        const sliderHorizontal = new Gtk.Scale({
            orientation: Gtk.Orientation.HORIZONTAL,
            adjustment: new Gtk.Adjustment({
                lower: 0.0,
                upper: 1.0,
                step_increment: 0.01,
                page_increment: 0.1,
                value: settings.get_double('l2-horizontal'),
            }),
            digits: 2,
            hexpand: true,
        });
        // Conectar o slider ao GSettings
        settings.bind(
            'l2-horizontal',
            sliderHorizontal.get_adjustment(),
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );

        const rowHorizontal = new Adw.ActionRow({
            title: 'Posição horizontal (linha 2)',
            activatable_widget: sliderHorizontal,
        });
        rowHorizontal.add_suffix(sliderHorizontal);
        rowHorizontal.set_activatable_widget(sliderHorizontal);
        positionGroup.add(rowHorizontal);


        // --- Seção de Aparência ---
        const appearanceGroup = new Adw.PreferencesGroup({
            title: 'Aparência',
            description: 'Tamanho e opacidade do texto exibido na tela.',
        });
        page.add(appearanceGroup);

        // Slider Opacidade
        const opacityScale = new Gtk.Scale({
            orientation: Gtk.Orientation.HORIZONTAL,
            adjustment: new Gtk.Adjustment({
                lower: 0,
                upper: 255,
                step_increment: 1,
                page_increment: 10,
                value: settings.get_int('opacity'),
            }),
            digits: 0,
            hexpand: true,
        });
        settings.bind(
            'opacity',
            opacityScale.get_adjustment(),
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );

        const rowOpacity = new Adw.ActionRow({
            title: 'Opacidade (0–255)',
            activatable_widget: opacityScale,
        });
        rowOpacity.add_suffix(opacityScale);
        rowOpacity.set_activatable_widget(opacityScale);
        appearanceGroup.add(rowOpacity);

        // Slider Tamanho Linha 1
        const sizeL1Scale = new Gtk.Scale({
            orientation: Gtk.Orientation.HORIZONTAL,
            adjustment: new Gtk.Adjustment({
                lower: 8,
                upper: 100,
                step_increment: 1,
                page_increment: 5,
                value: settings.get_int('size-l1'),
            }),
            digits: 0,
            hexpand: true,
        });
        settings.bind(
            'size-l1',
            sizeL1Scale.get_adjustment(),
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );

        const rowSizeL1 = new Adw.ActionRow({
            title: 'Tamanho da linha 1 (px)',
            activatable_widget: sizeL1Scale,
        });
        rowSizeL1.add_suffix(sizeL1Scale);
        rowSizeL1.set_activatable_widget(sizeL1Scale);
        appearanceGroup.add(rowSizeL1);

        // Slider Tamanho Linha 2
        const sizeL2Scale = new Gtk.Scale({
            orientation: Gtk.Orientation.HORIZONTAL,
            adjustment: new Gtk.Adjustment({
                lower: 8,
                upper: 100,
                step_increment: 1,
                page_increment: 5,
                value: settings.get_int('size-l2'),
            }),
            digits: 0,
            hexpand: true,
        });
        settings.bind(
            'size-l2',
            sizeL2Scale.get_adjustment(),
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );

        const rowSizeL2 = new Adw.ActionRow({
            title: 'Tamanho da linha 2 (px)',
            activatable_widget: sizeL2Scale,
        });
        rowSizeL2.add_suffix(sizeL2Scale);
        rowSizeL2.set_activatable_widget(sizeL2Scale);
        appearanceGroup.add(rowSizeL2);
    }
}
