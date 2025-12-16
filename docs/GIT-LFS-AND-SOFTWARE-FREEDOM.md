# Git LFS and Software Freedom Conservancy Integration

## Git Large File Storage (Git LFS)

### What is Git LFS?
Git Large File Storage (LFS) is a Git extension that handles large files by storing references in your repository while keeping the actual file contents on a separate server.

### Documentation
- [Official Git LFS Documentation](https://git-lfs.com/)
- [GitHub Git LFS](https://github.com/git-lfs/git-lfs)
- [Installation Guide](https://git-lfs.com/)

### Current Configuration
Your project is configured to use Git LFS for the following file types:
- `*.json`
- `*.zip`
- `*.exe`
- `*.dmg`
- `*.img`
- Specific large files in `Farbriqautions/` and `Fixpatch/` directories

## Software Freedom Conservancy

### What is Software Freedom Conservancy?
Software Freedom Conservancy is a not-for-profit organization that helps promote, improve, develop, and defend Free, Libre, and Open Source Software (FLOSS) projects.

### Resources
- [Official Website](https://sfconservancy.org/)
- [Become a Supporter](https://sfconservancy.org/supporter/)
- [Current Projects](https://sfconservancy.org/projects/)

## GitHub Integration

### Git LFS with GitHub
- [GitHub Git LFS Documentation](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-git-large-file-storage)
- [Managing Large Files](https://docs.github.com/en/repositories/working-with-files/managing-large-files)

## Setup Instructions

### Installing Git LFS
1. Download and install Git LFS from [git-lfs.com](https://git-lfs.com/)
2. Run in your terminal:
   ```bash
   git lfs install
   ```
3. Track large files:
   ```bash
   git lfs track "*.zip"
   git lfs track "*.exe"
   # Add other file patterns as needed
   ```

### Verifying Installation
```bash
git lfs env
```

## Best Practices
- Always commit and push changes to Git LFS files using standard Git commands
- Be mindful of storage quotas when working with large files
- Consider using `.gitignore` to prevent accidentally committing large files without LFS

## Support
For issues with Git LFS, visit the [Git LFS GitHub repository](https://github.com/git-lfs/git-lfs/issues)
