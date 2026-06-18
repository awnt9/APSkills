---
name: react-flat-component
description: Create flat, visually appealing React components in a CodePen-style layout.
---

# Skill: Flat React Visual Component — CodePen Style

## Purpose
Create a self-contained visual React component in the CodePen three-panel style: **one HTML panel, one CSS panel, and one JSX panel**. The component must represent a user-specified object using a **flat design** aesthetic: pastel colors, simple geometric shapes, no black outlines, no realistic texture, no heavy shadows, no skeuomorphism, and no unnecessary detail.

The skill is for generating visual React components that can optionally include **user-triggered animation**. There must be **no animation by default** unless the user explicitly asks for an interactive animation. When animation is requested, it must be triggered by user interaction through JavaScript/React state, such as click, hover, pointer movement, drag, toggle, or keyboard focus.

## User Input Contract
The user must provide:

```text
Object to represent: <object, character, icon, scene, UI item, mascot, etc.>
Optional interaction animation: <click / hover / drag / pointer / focus behavior>
Optional constraints: <size, colors, mood, text labels, responsive behavior, accessibility, etc.>
```

If the user omits animation, create a static component.

If the user asks for “animate it” without specifying the trigger, choose a simple interaction trigger that fits the object, usually click or hover, and state the chosen trigger briefly in the answer.

## Output Format
Always output exactly three code blocks, in this order:

1. `HTML`
2. `CSS`
3. `JSX`

Use labels exactly like this:

```html
<!-- HTML -->
```

```css
/* CSS */
```

```jsx
// JSX
```

Do not include build tooling, package installation, Tailwind, external images, SVG files, canvas, or third-party animation libraries unless the user explicitly asks.

The result must work in CodePen with React and ReactDOM enabled, using Babel for JSX.

## CodePen Panel Rules

### HTML panel
Use a single root node only:

```html
<div id="root"></div>
```

Do not place visual markup in HTML. All component structure belongs in JSX.

### CSS panel
All styling must be plain CSS.

Prefer:
- CSS custom properties for the palette.
- `border-radius`, `transform`, `opacity`, `filter`, `clip-path`, and simple positioning.
- `transition` for interaction states.
- `@keyframes` only when the animation is explicitly requested and only when triggered by a class or state.

Avoid:
- Black outlines.
- Thick strokes.
- Realistic shadows.
- Photorealism.
- Gradients unless extremely subtle.
- Complex nested selectors that are hard to edit.
- CSS that animates constantly by default.

### JSX panel
Use a single React component named `App`.

Mount it like this:

```jsx
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
```

Use React state only when needed for interactivity.

For interactive animation, prefer:
- `useState` for toggles.
- `onClick`, `onPointerMove`, `onPointerLeave`, `onMouseEnter`, `onMouseLeave`, `onKeyDown`, or `onFocus` as appropriate.
- Dynamic class names such as `is-active`, `is-open`, `is-wiggling`, or `is-tilted`.
- Inline CSS variables only for pointer-driven values, such as `--x`, `--y`, or `--tilt`.

Do not use a timer, interval, or automatic loop unless the user explicitly asks for a repeated animation after interaction.

## Flat Design Style Rules

Follow this visual grammar:

### Shape language
Build the object from simple shapes:
- circles
- ovals
- rounded rectangles
- capsules
- triangles
- simple blobs
- pseudo-elements
- small decorative dots or pills

Use layering and spacing instead of outlines.

### Color language
Use pastel palettes with 4–7 colors:

```css
:root {
  --bg: #f7f3ea;
  --surface: #ffffff;
  --primary: #8ecae6;
  --secondary: #ffb5a7;
  --accent: #b8e0d2;
  --detail: #6d6875;
  --soft-shadow: rgba(80, 80, 120, 0.12);
}
```

Guidelines:
- Use one calm background.
- Use one dominant object color.
- Use one or two accent colors.
- Use muted dark colors only for tiny details, not outlines.
- Never use pure black for borders or strokes.

### Depth
Keep it mostly 2D.

Allowed:
- very soft shadow under the object
- slight offset shadow for card depth
- overlapping shapes
- small highlight patches using opacity

Avoid:
- bevels
- hard drop shadows
- glassmorphism
- neumorphism
- strong gradients
- 3D realism

### Detail density
The component should be recognizable with the fewest possible shapes.

Start with the silhouette. Add only the details needed for recognition. Remove any detail that does not help identify the object.

## Interaction Animation Rules

The default state must be still.

Only animate when the user interacts. Good patterns:

### Click toggle
Use when the object can open, bounce, switch, blink, bloom, or change mood.

Examples:
- lamp turns on
- mailbox opens
- cat blinks
- plant grows
- rocket hops
- calendar flips

### Hover reaction
Use when the object should feel responsive but not change state permanently.

Examples:
- card floats slightly
- clouds drift a little
- button squishes
- character waves
- icon rotates gently

### Pointer movement
Use when the object can track the cursor.

Examples:
- eyes follow pointer
- compass tilts
- balloon leans
- robot head turns

### Drag
Use only if the user asks for drag behavior.

Examples:
- draggable magnet
- slider-like object
- movable sticker

### Keyboard/focus
For clickable components, support keyboard activation with `tabIndex`, `role="button"`, and `onKeyDown` for Enter/Space when the visual is not a native button.

## Animation Implementation Pattern

Use state-controlled classes:

```jsx
function App() {
  const [active, setActive] = React.useState(false);

  return (
    <main className="stage">
      <div
        className={`flat-object ${active ? "is-active" : ""}`}
        role="button"
        tabIndex="0"
        onClick={() => setActive(!active)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setActive((value) => !value);
          }
        }}
        aria-pressed={active}
      >
        {/* shapes */}
      </div>
    </main>
  );
}
```

Use CSS transitions or keyframes gated by `.is-active`:

```css
.flat-object {
  transition: transform 220ms ease, filter 220ms ease;
}

.flat-object.is-active {
  transform: translateY(-8px) scale(1.03);
}

.flat-object.is-active .part {
  animation: soft-pop 420ms ease both;
}

@keyframes soft-pop {
  0% { transform: scale(0.92); }
  60% { transform: scale(1.08); }
  100% { transform: scale(1); }
}
```

Never attach `animation` to the base class if the user did not request automatic motion.

## Component Construction Method

Follow this process internally:

1. Identify the object’s simplest silhouette.
2. Break it into 5–14 flat shapes.
3. Assign a pastel palette.
4. Build the structure in JSX with semantic class names.
5. Add CSS layout and shape geometry.
6. Add optional interactive state only if requested.
7. Ensure the object is centered inside a stage.
8. Ensure the output is editable and readable.
9. Keep the code compact but not cryptic.
10. Test mentally that the CodePen panels work together.

## Recommended JSX Structure

Use a wrapper and parts:

```jsx
function App() {
  return (
    <main className="stage" aria-label="Flat illustration">
      <section className="scene">
        <div className="object" aria-label="Flat <object name>">
          <span className="part part-name" />
          <span className="part part-name" />
          <span className="part part-name" />
        </div>
      </section>
    </main>
  );
}
```

Use `span` or `div` for decorative shapes. Add `aria-hidden="true"` to purely decorative internal parts when the wrapper has a label.

## CSS Architecture

Use this general structure:

```css
:root {
  --bg: #f8f1e7;
  --primary: #a7c7e7;
  --secondary: #f7b7a3;
  --accent: #b8e0d2;
  --detail: #6d6875;
  --shadow: rgba(76, 76, 110, 0.14);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: var(--bg);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.stage {
  width: min(92vw, 520px);
  min-height: 420px;
  display: grid;
  place-items: center;
}

.scene {
  position: relative;
  width: 320px;
  height: 320px;
}

.object,
.part {
  position: absolute;
}
```

## Quality Checklist

Before final output, verify:

- The component uses only one HTML root.
- The JSX defines and renders `App`.
- The visual object is recognizable.
- The style is flat, pastel, simple, and friendly.
- There are no black outlines.
- There is no default animation unless requested.
- Any animation is triggered by user interaction.
- Interactive visuals are keyboard accessible when clickable.
- CSS class names are descriptive.
- No external assets are required.
- The code is suitable for CodePen.

## Refusal / Redirection Rules

If the requested object involves copyrighted characters, logos, or trademarked mascots, do not recreate them exactly. Offer a generic alternative inspired by broad attributes.

Example:
- Instead of “make Pikachu,” create “a cute yellow electric mouse mascot in a flat pastel style.”
- Instead of “Apple logo,” create “a simple pastel fruit icon.”

If the user requests hateful, sexual, violent, or unsafe content, refuse briefly and offer a safe visual alternative.

## Example Request

```text
Object to represent: a sleepy pastel robot
Optional interaction animation: on click, it wakes up and its antenna bounces
```

## Example Output

```html
<!-- HTML -->
<div id="root"></div>
```

```css
/* CSS */
:root {
  --bg: #f8f1e7;
  --bot: #a7c7e7;
  --bot-dark: #7faed1;
  --accent: #ffb5a7;
  --screen: #d8f3dc;
  --detail: #6d6875;
  --shadow: rgba(76, 76, 110, 0.14);
}

* { box-sizing: border-box; }

body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: var(--bg);
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
}

.stage {
  width: min(92vw, 520px);
  min-height: 420px;
  display: grid;
  place-items: center;
}

.robot {
  position: relative;
  width: 240px;
  height: 260px;
  cursor: pointer;
  outline: none;
  transition: transform 220ms ease;
}

.robot:focus-visible {
  filter: drop-shadow(0 0 0.75rem rgba(142, 202, 230, 0.75));
}

.robot.is-awake {
  transform: translateY(-6px);
}

.shadow {
  position: absolute;
  left: 42px;
  bottom: 8px;
  width: 156px;
  height: 24px;
  border-radius: 999px;
  background: var(--shadow);
}

.body {
  position: absolute;
  left: 45px;
  top: 78px;
  width: 150px;
  height: 150px;
  border-radius: 34px;
  background: var(--bot);
}

.screen {
  position: absolute;
  left: 68px;
  top: 112px;
  width: 104px;
  height: 58px;
  border-radius: 20px;
  background: var(--screen);
}

.eye {
  position: absolute;
  top: 26px;
  width: 22px;
  height: 6px;
  border-radius: 999px;
  background: var(--detail);
  transition: height 180ms ease, transform 180ms ease;
}

.eye-left { left: 26px; }
.eye-right { right: 26px; }

.robot.is-awake .eye {
  height: 18px;
  transform: translateY(-6px);
}

.cheek {
  position: absolute;
  top: 39px;
  width: 14px;
  height: 8px;
  border-radius: 999px;
  background: var(--accent);
  opacity: 0.8;
}

.cheek-left { left: 12px; }
.cheek-right { right: 12px; }

.antenna {
  position: absolute;
  left: 113px;
  top: 34px;
  width: 14px;
  height: 58px;
  border-radius: 999px;
  background: var(--bot-dark);
  transform-origin: bottom center;
}

.robot.is-awake .antenna {
  animation: antenna-bounce 520ms ease both;
}

.dot {
  position: absolute;
  left: 101px;
  top: 20px;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--accent);
}

.arm {
  position: absolute;
  top: 126px;
  width: 36px;
  height: 76px;
  border-radius: 999px;
  background: var(--bot-dark);
}

.arm-left { left: 18px; transform: rotate(8deg); }
.arm-right { right: 18px; transform: rotate(-8deg); }

.foot {
  position: absolute;
  bottom: 24px;
  width: 54px;
  height: 28px;
  border-radius: 999px;
  background: var(--bot-dark);
}

.foot-left { left: 58px; }
.foot-right { right: 58px; }

@keyframes antenna-bounce {
  0% { transform: rotate(0deg) scaleY(1); }
  35% { transform: rotate(-10deg) scaleY(1.08); }
  70% { transform: rotate(8deg) scaleY(0.96); }
  100% { transform: rotate(0deg) scaleY(1); }
}
```

```jsx
// JSX
function App() {
  const [awake, setAwake] = React.useState(false);

  const toggleAwake = () => setAwake((value) => !value);

  return (
    <main className="stage">
      <div
        className={`robot ${awake ? "is-awake" : ""}`}
        role="button"
        tabIndex="0"
        aria-label="Sleepy flat robot. Click to wake it up."
        aria-pressed={awake}
        onClick={toggleAwake}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleAwake();
          }
        }}
      >
        <span className="shadow" aria-hidden="true" />
        <span className="antenna" aria-hidden="true" />
        <span className="dot" aria-hidden="true" />
        <span className="arm arm-left" aria-hidden="true" />
        <span className="arm arm-right" aria-hidden="true" />
        <span className="body" aria-hidden="true" />
        <span className="screen" aria-hidden="true">
          <span className="eye eye-left" />
          <span className="eye eye-right" />
          <span className="cheek cheek-left" />
          <span className="cheek cheek-right" />
        </span>
        <span className="foot foot-left" aria-hidden="true" />
        <span className="foot foot-right" aria-hidden="true" />
      </div>
    </main>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
```

## Notes for the Assistant Using This Skill

- Be visual, not verbose.
- Prioritize editable code over clever code.
- Treat each JSX element as a flat shape.
- Use interaction as a delightful response, not as background motion.
- Keep the result close to CodePen culture: compact, playful, immediately runnable, and easy to remix.

## Inspiration Notes

This skill follows common flat-design principles: simple 2D shapes, minimal depth, lively but controlled color, and reduced decorative detail. It also follows the CodePen convention where React demos are split into HTML, CSS, and JSX panels, with Babel enabled for JSX. Interactive examples on CodePen commonly use hover, click, and state-driven class changes; this skill restricts those patterns so animations happen only after user interaction.
