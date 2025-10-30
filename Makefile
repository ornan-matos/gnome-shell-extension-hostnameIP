schemdir = ./hostnameIP@ornan-matos/schemas
$(schemdir)/gschemas.compiled: $(schemdir)/org.gnome.shell.extensions.hostnameIP.gschema.xml
	glib-compile-schemas $(schemdir)/
clean:
	rm $(schemdir)/gschemas.compiled
