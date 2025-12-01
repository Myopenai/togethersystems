-- Migration: Standard Block-Typen initialisieren
-- Fügt die Basis-Block-Typen für den Website-Builder hinzu

INSERT OR IGNORE INTO cms_block_types (id, name, category, schema_json, component_ref, created_at) VALUES
(
  'block-text',
  'Text',
  'basic',
  '{"type":"object","properties":{"text":{"type":"string","title":"Text"},"alignment":{"type":"string","enum":["left","center","right"],"default":"left"}},"required":["text"]}',
  'blocks/TextBlock',
  datetime('now')
),
(
  'block-image',
  'Bild',
  'basic',
  '{"type":"object","properties":{"imageId":{"type":"string","title":"Bild-ID"},"alt":{"type":"string","title":"Alt-Text"},"width":{"type":"number"},"height":{"type":"number"}},"required":["imageId"]}',
  'blocks/ImageBlock',
  datetime('now')
),
(
  'block-button',
  'Button',
  'basic',
  '{"type":"object","properties":{"text":{"type":"string","title":"Button-Text"},"url":{"type":"string","title":"Link-URL"},"style":{"type":"string","enum":["primary","secondary","ghost"],"default":"primary"}},"required":["text","url"]}',
  'blocks/ButtonBlock',
  datetime('now')
),
(
  'block-hero',
  'Hero-Bereich',
  'basic',
  '{"type":"object","properties":{"title":{"type":"string","title":"Titel"},"subtitle":{"type":"string","title":"Untertitel"},"backgroundImageId":{"type":"string"},"ctaText":{"type":"string"},"ctaUrl":{"type":"string"}},"required":["title"]}',
  'blocks/HeroBlock',
  datetime('now')
),
(
  'block-gallery',
  'Galerie',
  'basic',
  '{"type":"object","properties":{"images":{"type":"array","items":{"type":"string"},"title":"Bild-IDs"},"columns":{"type":"number","default":3},"gutter":{"type":"number","default":8}},"required":["images"]}',
  'blocks/GalleryBlock',
  datetime('now')
),
(
  'block-form',
  'Formular',
  'basic',
  '{"type":"object","properties":{"fields":{"type":"array","items":{"type":"object","properties":{"type":{"type":"string"},"name":{"type":"string"},"label":{"type":"string"},"required":{"type":"boolean"}}}},"submitUrl":{"type":"string"},"submitText":{"type":"string","default":"Absenden"}},"required":["fields"]}',
  'blocks/FormBlock',
  datetime('now')
),
(
  'block-video',
  'Video',
  'basic',
  '{"type":"object","properties":{"videoUrl":{"type":"string","title":"Video-URL"},"thumbnailId":{"type":"string"},"autoplay":{"type":"boolean","default":false},"controls":{"type":"boolean","default":true}},"required":["videoUrl"]}',
  'blocks/VideoBlock',
  datetime('now')
),
(
  'block-container',
  'Container',
  'layout',
  '{"type":"object","properties":{"padding":{"type":"number","default":16},"backgroundColor":{"type":"string"},"maxWidth":{"type":"number"}},"required":[]}',
  'blocks/ContainerBlock',
  datetime('now')
);









