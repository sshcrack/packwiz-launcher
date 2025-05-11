/**
 * Font options available for the Minecraft-themed UI
 */
type FontOption = 'press-start' | 'silkscreen' | 'pixelify' | 'ibm-plex';

/**
 * Changes the Minecraft font throughout the application
 * @param fontOption The font option to switch to
 */
export function switchMinecraftFont(fontOption: FontOption): void {
    // Get the root HTML element to modify CSS variables
    const root = document.documentElement;

    // Font family mapping
    let fontFamily = '';
    let fontSizeAdjust = '1';
    let letterSpacing = '0px';

    switch (fontOption) {
        case 'press-start':
            fontFamily = '"Press Start 2P", cursive';
            fontSizeAdjust = '0.85';
            break;
        case 'silkscreen':
            fontFamily = '"Silkscreen", cursive';
            fontSizeAdjust = '0.9';
            break;
        case 'pixelify':
            fontFamily = '"Pixelify Sans", cursive';
            fontSizeAdjust = '1';
            letterSpacing = '0.5px';
            break;
        case 'ibm-plex':
            fontFamily = '"IBM Plex Mono", monospace';
            fontSizeAdjust = '1';
            letterSpacing = '0.2px';
            break;
    }

    // Update the CSS variables
    document.documentElement.style.setProperty('--minecraft-font', fontFamily);
    document.documentElement.style.setProperty('--minecraft-font-size-adjust', fontSizeAdjust);
    document.documentElement.style.setProperty('--minecraft-letter-spacing', letterSpacing);

    // Apply styles to .font-minecraft elements
    const style = document.createElement('style');
    style.textContent = `
    .font-minecraft {
      font-family: var(--minecraft-font);
      letter-spacing: var(--minecraft-letter-spacing);
      font-size: calc(1em * var(--minecraft-font-size-adjust));
    }
  `;

    // Remove old style if it exists
    const oldStyle = document.getElementById('minecraft-font-style');
    if (oldStyle) {
        oldStyle.remove();
    }

    // Add the new style
    style.id = 'minecraft-font-style';
    document.head.appendChild(style);
}

// To use this utility, call:
// switchMinecraftFont('silkscreen');