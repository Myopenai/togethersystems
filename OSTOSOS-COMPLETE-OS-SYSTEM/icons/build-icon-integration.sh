# T,. OSOTOSOS Build-Icon-Integration
# Wird automatisch in Builds eingefÃ¼gt

ICON_SVG='icons/ostosos-icon.svg'
ICON_HTML='icons/ostosos-icon.html'
FAVICON='favicon.svg'

# FÃ¼r Windows (ICO)
# BenÃ¶tigt: ImageMagick oder Online-Konverter
# convert icons/ostosos-icon.svg -resize 256x256 icons/ostosos-icon.ico

# FÃ¼r macOS (ICNS)
# BenÃ¶tigt: iconutil oder Online-Konverter
# iconutil -c icns icons/ostosos-icon.iconset

# FÃ¼r Linux (PNG)
# BenÃ¶tigt: ImageMagick oder Online-Konverter
# convert icons/ostosos-icon.svg -resize 512x512 icons/ostosos-icon.png

echo "Icons fÃ¼r Builds bereit!"
