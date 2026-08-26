# Image credits

The placeholder project images in this folder are from [Unsplash](https://unsplash.com), used
under the [Unsplash License](https://unsplash.com/license). Attribution is not required by that
licence, but crediting the photographer costs nothing and is the right habit.

| File | Photographer | Source |
| --- | --- | --- |
| `project-trailhead.jpg` | Paul Jarvis | https://unsplash.com/photos/Ven2CV8IJ5A |
| `project-studyloop.jpg` | Alejandro Escamilla | https://unsplash.com/photos/cZhUxIQjILg |
| `project-bus-time-bot.jpg` | Robin Röcker | https://unsplash.com/photos/qUToqliACNA |

`avatar-placeholder.svg` and `favicon.svg` were drawn for this project and are covered by the
repo's MIT licence.

## Replacing these

Put your own file in this folder and point at it from `src/content/profile.ts`:

```ts
image: {
  src: '/images/my-project.png',
  alt: 'A short description of what the image shows.',
  credit: 'Photo by ... on Unsplash',   // drop this if the image is yours
},
```

`alt` is required by the schema whenever there is an image. That is deliberate - a screen reader
user should get the same information as everyone else, and `npm test` will fail if you forget.

Keep files under about 200KB. These are 960px wide, which is roughly twice the size they display
at, so they stay sharp on a high-density screen without being wasteful.
