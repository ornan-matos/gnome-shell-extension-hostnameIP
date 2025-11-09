'use strict';

const { Adw, Gio, Gtk } = imports.gi;

function init() { }

function fillPreferencesWindow(window) {
    const settings = new Gio.Settings({
        schema_id: 'org.gnome.shell.extensions.hostnameIP',
    });

    // Criar página principal
    const page = new Adw.PreferencesPage();

    // Seção de posição
    const positionGroup = new Adw.PreferencesGroup({
        title: 'Posição do texto',
        description: 'Ajuste a posição da segunda linha (hostname/IP).',
    });

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
    sliderVertical.connect('value-changed', w => {
        settings.set_double('l2-vertical', w.get_value());
    });

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
    sliderHorizontal.connect('value-changed', w => {
        settings.set_double('l2-horizontal', w.get_value());
    });

    positionGroup.add(new Adw.ActionRow({
        title: 'Posição vertical (linha 2)',
        activatable_widget: sliderVertical,
    }));
    positionGroup.add(sliderVertical);

    positionGroup.add(new Adw.ActionRow({
        title: 'Posição horizontal (linha 2)',
        activatable_widget: sliderHorizontal,
    }));
    positionGroup.add(sliderHorizontal);

    // Seção de aparência
    const appearanceGroup = new Adw.PreferencesGroup({
        title: 'Aparência',
        description: 'Tamanho e opacidade do texto exibido na tela.',
    });

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
    opacityScale.connect('value-changed', w => {
        settings.set_int('opacity', w.get_value());
    });

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
    sizeL1Scale.connect('value-changed', w => {
        settings.set_int('size-l1', w.get_value());
    });

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
    sizeL2Scale.connect('value-changed', w => {
        settings.set_int('size-l2', w.get_value());
    });

    appearanceGroup.add(new Adw.ActionRow({
        title: 'Opacidade (0–255)',
        activatable_widget: opacityScale,
    }));
    appearanceGroup.add(opacityScale);

    appearanceGroup.add(new Adw.ActionRow({
        title: 'Tamanho da linha 1 (px)',
        activatable_widget: sizeL1Scale,
    }));
    appearanceGroup.add(sizeL1Scale);

    appearanceGroup.add(new Adw.ActionRow({
        title: 'Tamanho da linha 2 (px)',
        activatable_widget: sizeL2Scale,
    }));
    appearanceGroup.add(sizeL2Scale);

    // Montar janela
    page.add(positionGroup);
    page.add(appearanceGroup);
    window.add(page);
}

function buildPrefsWidget() {
    const window = new Adw.PreferencesWindow();
    fillPreferencesWindow(window);
    return window;
}

