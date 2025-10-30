# Show Hostname and IP
[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](./LICENSE)

Uma extensão do GNOME Shell que exibe o hostname e o endereço IP local diretamente na sua área de trabalho.

O texto é exibido abaixo das janelas (na camada do desktop) e é atualizado automaticamente.

## Funcionalidades
* **Linha 1:** Exibe o `hostname` da máquina.
* **Linha 2:** Exibe o primeiro endereço IP local (obtido via `hostname -I`).
* **Atualização Automática:** As informações são atualizadas a cada 30 segundos.
* **Customizável:** Permite ajustar a posição vertical, posição horizontal, opacidade e o tamanho da fonte de ambas as linhas através da janela de configurações da extensão.

## Instalação (a partir do Git)

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/ornan-matos/gnome-shell-extension-hostnameIP.git](https://github.com/ornan-matos/gnome-shell-extension-hostnameIP.git)
    ```

2.  **Entre no diretório da extensão:**
    ```bash
    cd gnome-shell-extension-hostnameIP/
    ```

3.  **Compile os schemas (necessário por causa do Makefile):**
    ```bash
    make -C hostnameIP@ornan-matos/
    ```

4.  **Crie um link simbólico para a pasta de extensões do GNOME:**
    ```bash
    ln -s $(realpath hostnameIP@ornan-matos) ~/.local/share/gnome-shell/extensions/
    ```

5.  **Recarregue o GNOME Shell:**
    * Pressione `Alt` + `F2`
    * Digite `r`
    * Pressione `Enter`

## Agradecimentos
Este projeto é um fork da extensão [Activate GNOME](https://github.com/isjerryxiao/gnome-shell-extension-activate-gnome) de isjerryxiao.
