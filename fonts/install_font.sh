#!/bin/bash
# Install Kuzmann Sans font on *nix.
# Usage: sudo bash install_font.sh
if [ "$(uname)" = "Linux" ]; then
	cp "Kazmann Sans.ttf" /usr/share/fonts
	fc-cache -fv
elif [ "$(uname)" = "Darwin" ]; then
	cp "Kazmann Sans.ttf" /Library/Fonts
fi
