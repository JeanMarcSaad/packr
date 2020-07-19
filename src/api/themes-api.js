const themes = [
    {
        "name": "Warm Duvet",
        "class": "warm-duvet"
    },
    {
        "name": "Deep Blue",
        "class": "deep-blue"
    },
    {
        "name": "Silk",
        "class": "silk"
    },
    {
        "name": "Monochrome",
        "class": "monochrome"
    },
    {
        "name": "Cotton Candy",
        "class": "cotton-candy"
    },
    {
        "name": "Pastel",
        "class": "pastel"
    }
]

const default_theme = themes[0];
let current_theme = undefined;

const setThemeClass = (themeClass) => {
    let mainContainer = document.getElementById('main-container');
    mainContainer.classList = []
    mainContainer.classList.add(themeClass);
}

const getCurrTheme = () => {
    return new Promise((resolve) => {
        chrome.storage.local.get(['packr_theme'],(result) => {
          resolve(result.packr_theme?JSON.parse(result.packr_theme):default_theme);
        });
    });
}

const restoreCurrTheme = () => {
    return new Promise(resolve => {
        getCurrTheme()
        .then((theme) => {
            setCurrTheme(theme)
            .then(() => resolve)
        });
    });
}

const setCurrTheme = (theme) => {
    return new Promise((resolve, reject) => {
        if(!themes.filter(t => t.name == theme.name && t.class == theme.class).length > 0) {
            reject("Theme not recognized");
        }
        chrome.storage.local.set({packr_theme: JSON.stringify(theme)}, () => {
            setThemeClass(theme.class);
            current_theme = theme;
            resolve();
        });
    });
}

const getThemes = () => {
    let __themes = themes.map((theme) => {
        if(current_theme && theme.class == current_theme.class)
            theme['selected'] = true
        else
            theme['selected'] = false
        return theme;
    })
    return __themes;
}

const setOnThemeChanged = () => {
    let _callback = (changes, area) => {
        if (area == "local" && "packr_theme" in changes) {
          restoreCurrTheme();
        }
    };
    chrome.storage.onChanged.addListener(_callback);
}

module.exports = {
    name: "themesApi",
    getThemes() {
        return getThemes();
    },
    restoreCurrTheme() {
        return restoreCurrTheme();
    },
    setCurrTheme({ theme: theme}) {
        return setCurrTheme(theme);
    },
    setOnThemeChanged() {
        setOnThemeChanged();
    }
}