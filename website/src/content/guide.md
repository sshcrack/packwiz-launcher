# Modpack Creation Guide

A comprehensive guide to creating and publishing your Minecraft modpack

## Overview

This guide will walk you through the complete process of creating a Minecraft modpack using packwiz, publishing it to GitHub, and setting it up with our installer generator. Follow these steps to create a professional, easy-to-install modpack for your players.

### What you'll need:

- [Java](https://www.oracle.com/java/technologies/downloads/) installed on your computer
- A [GitHub](https://github.com/signup) account
- [PrismLauncher](https://prismlauncher.org/download/) installed
- Basic understanding of Minecraft modpacks

## Step 1: Installing packwiz

packwiz is a command-line tool that helps you manage Minecraft modpacks. Let's install it:

### Option 1: Pre-built binaries (recommended)

1. Download from [GitHub Actions](https://github.com/packwiz/packwiz/actions) - select the top build, then download the artifact ZIP for your system at the bottom of the page
2. Or use [nightly.link](https://nightly.link/packwiz/packwiz/workflows/go/main) for an easier download experience - just select the artifact for your system
3. Extract the downloaded file and add the folder to your PATH environment variable or move it to your modpack directory
4. For Windows users, [here's a tutorial](https://www.howtogeek.com/118594/how-to-edit-your-system-path-for-easy-command-line-access/) on editing your PATH environment variable

### Option 2: Using go

If you have Go installed, you can use:

```
go install github.com/packwiz/packwiz@latest
```

For more detailed installation instructions, visit:
[https://packwiz.infra.link/installation/](https://packwiz.infra.link/installation/)

## Step 2: Creating Your Modpack

### Initialize your modpack

Open a terminal in the directory where you want to create your modpack and run:

```
packwiz init
```

This command will ask you some questions about your modpack. You'll be prompted for:

```
Modpack name:     # Enter your modpack name
Author:           # Enter your name or team name
Version:          # Enter a version number
Minecraft version:  # Enter your target Minecraft version
Mod loader:       # Enter the mod loader (fabric, forge, quilt, etc.)
Loader version:   # Enter the specific version of the mod loader
```

Answer each prompt with your desired values.

### Adding mods and resource packs

packwiz makes it easy to add mods from CurseForge and Modrinth. These commands will automatically create the necessary `.pw.toml` metadata files for you.

#### From CurseForge

You can add mods from CurseForge in several ways:

```
packwiz cf install indium                                    # by slug
packwiz cf install https://www.curseforge.com/minecraft/mc-mods/indium  # by URL
packwiz cf install Indium                                   # by search
```

#### From Modrinth

Similarly for Modrinth:

```
packwiz mr install indium                                    # by slug
packwiz mr install https://modrinth.com/mod/indium           # by URL
packwiz mr install Fabric Rendering Sodium                   # by search
```

Dependencies are automatically detected, and packwiz will prompt you to install them if needed.

#### Updating mods

To update your mods:

```
packwiz update --all    # Update all mods at once
packwiz update [mod-id] # Update a specific mod
```

#### Config files and other internal files

Simply place configuration files, scripts, and other files in the appropriate folders (like `config/`) and run `packwiz refresh` to update the index.

#### Custom/external mods

For mods that aren't on CurseForge or Modrinth, you'll need to create a `.pw.toml` file manually and provide the download URL and hash.

For more detailed instructions on adding mods, visit:
[https://packwiz.infra.link/tutorials/creating/adding-mods/](https://packwiz.infra.link/tutorials/creating/adding-mods/)

## Step 3: Publishing to GitHub

### Option 1: Using GitHub Desktop (Beginner-Friendly)

1. Download and install [GitHub Desktop](https://desktop.github.com/)
2. Open GitHub Desktop and sign in to your GitHub account
3. Go to File → Add local repository and select your modpack folder
4. Click "Create a Repository" when prompted
5. Fill in the repository details and make sure it's set to be public
6. Before publishing, create the necessary `.gitignore` and `.gitattributes` files in your modpack directory:

**.gitignore:**
```
# Exclude exported CurseForge zip files
*.zip

# Exclude exported Modrinth modpacks
*.mrpack
```

**.gitattributes:**
```
# Disable Git line ending conversion, to prevent packwiz index hashes changing when committing from Windows
* -text
```

7. Click "Publish repository" to publish it to GitHub

### Option 2: Using Git Command Line

Initialize a Git repository in your modpack directory:

```
git init
```

Add .gitignore and .gitattributes files (important for proper handling of pack files).
Create these files in your modpack directory with the following content:

**.gitignore:**

```
# Exclude exported CurseForge zip files
*.zip

# Exclude exported Modrinth modpacks
*.mrpack
```

**.gitattributes:**

```
# Disable Git line ending conversion, to prevent packwiz index hashes changing when committing from Windows
* -text
```

Now, add your files to git and make your first commit:

```
git add .
git commit -m "Initial modpack commit"
```

Create a new repository on GitHub (without initializing it), then link and push your local repository:

```
git remote add origin https://github.com/yourusername/your-modpack-name.git
git branch -M main
git push -u origin main
```

For more information on using Git with packwiz, visit:
[https://packwiz.infra.link/tutorials/creating/git/](https://packwiz.infra.link/tutorials/creating/git/)

### Getting the Raw GitHub Link to pack.toml

1. Navigate to your repository on GitHub
2. Go to the root directory of your modpack and click on `pack.toml`
3. Click the "Raw" button in the top-right of the file view
4. Copy the URL from your browser's address bar. It should look like:
   `https://raw.githubusercontent.com/yourusername/your-modpack-name/main/pack.toml`
5. Save this URL - you'll need it as the "Packwiz URL" in the modpack generator

## Step 4: Setting Up the Base Pack with [PrismLauncher](https://prismlauncher.org/download/)

### Installing PrismLauncher

1. Download PrismLauncher from [https://prismlauncher.org/download](https://prismlauncher.org/download) for your operating system
2. Install and run PrismLauncher
3. If this is your first time running PrismLauncher, follow the setup wizard to configure Java

### Creating a Base Instance

The base instance is a clean Minecraft installation with just the modloader - no mods or configs.
This is important as the actual mods will be installed via packwiz.

1. Click "Add Instance" in PrismLauncher
2. Give your instance a name (e.g., "My Modpack Base")
3. Select the Minecraft version that matches your modpack
4. Select the modloader type (Fabric, Forge, etc.) and version that matches your modpack
5. Click "OK" to create the instance
6. Right-click on your new instance and select "Edit"
7. Configure any desired settings like memory allocation, Java arguments, etc.
8. Click "Close" to save settings

### Exporting the Base Pack

1. Right-click on your instance in PrismLauncher
2. Select "Export Instance"
3. In the dialog that appears, make sure only essential files are selected (usually the defaults are fine)
4. Click "Export" and choose a save location and filename (e.g., "base_modpack.zip")

### Uploading the Base Pack

You need to upload your base pack somewhere it can be downloaded. GitHub is a good option:

1. Go to your modpack repository on GitHub
2. Click on "Releases" on the right side
3. Click "Create a new release" or "Draft a new release"
4. Fill in a tag version (e.g., "v1.0-base") and title
5. Drag and drop your base_modpack.zip file into the assets section
6. Click "Publish release"
7. After publishing, click on the zip file in the release assets
8. Copy the URL - this will be your "Base Pack URL" for the modpack generator

## Step 5: Generating Your Modpack Installer

1. Return to the main page of this website
2. Fill in your modpack details:
   - Name, author, and description
   - Logo URL (a direct link to your modpack's logo image)
   - Packwiz URL (the raw GitHub link to your pack.toml file)
   - Base Pack URL (the direct download link to your base_modpack.zip)
   - Theme and background preferences
3. Optionally upload a custom icon for your installer
4. Click "Generate Installer"
5. Once processing is complete, download your custom installer
6. Distribute this installer to your players for a seamless modpack installation experience

## Updating Your Modpack

When you want to update your modpack:

1. Make changes to your packwiz modpack (add/remove mods, update configs, etc.)
2. Update your pack version in pack.toml
3. Commit and push your changes to GitHub

Players using your installer won't need to download a new version - the installer automatically pulls the latest version from your GitHub repository.

## Troubleshooting

### Common Issues

#### Issue: Installer can't download the modpack

Ensure your pack.toml URL is accessible and is the raw GitHub URL (starts with https://raw.githubusercontent.com/).
Check that your repository is public.

#### Issue: Mods not loading in the game

Verify that your modloader version matches the mods you've added.
Some mods may have dependencies that need to be included.

#### Issue: Base pack doesn't have the right Minecraft version

Make sure the Minecraft version and modloader in your base pack match what you specified in your packwiz modpack.

For more detailed information and advanced usage, please refer to the official packwiz documentation at [https://packwiz.infra.link/](https://packwiz.infra.link/)
