# Typography Styles

This folder contains typography styles for the Bezalel project.

## Specifications

### Heading

- **Font Size**: 71px
- **Line Height**: 79px
- **Font Family**: Poppins, sans-serif
- **Font Weight**: 700 (Bold)

### Subtext

- **Font Size**: 28px
- **Line Height**: 31px
- **Font Family**: Poppins, sans-serif
- **Font Weight**: 400 (Regular)

## Usage

### 1. JavaScript Object Styles

```javascript
import { typographyStyles } from "../typographyStyles";

// Use in inline styles or styled-components
const headingStyle = typographyStyles.heading;
const subtextStyle = typographyStyles.subtext;
```

### 2. CSS Classes

```javascript
import { typographyClasses } from '../typographyStyles';

// Use with className
<div className={typographyClasses.heading}>Heading Text</div>
<div className={typographyClasses.subtext}>Subtext</div>
```

### 3. Material UI Theme Override

```javascript
import { muiTypographyOverrides } from "../typographyStyles";
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: muiTypographyOverrides,
});
```

### 4. Direct CSS Injection

```javascript
import { typographyCSS } from "../typographyStyles";

// Inject into your CSS or use in a style tag
<style>{typographyCSS}</style>;
```

## Font Setup

Make sure to include the Poppins font in your project:

```html
<link
  href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap"
  rel="stylesheet"
/>
```

Or import in CSS:

```css
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap");
```
