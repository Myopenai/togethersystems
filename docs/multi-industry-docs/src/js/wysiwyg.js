// Simple WYSIWYG editor
document.addEventListener('DOMContentLoaded', function() {
    const wysiwygElement = document.getElementById('wysiwyg-content');
    
    if (wysiwygElement) {
        // Add basic styling to make the editable area more visible
        wysiwygElement.style.minHeight = '200px';
        wysiwygElement.style.padding = '1rem';
        wysiwygElement.style.border = '1px solid #ddd';
        wysiwygElement.style.borderRadius = '4px';
        wysiwygElement.style.marginTop = '1rem';
    }
});
