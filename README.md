# v-dragger

![Current Release](https://img.shields.io/github/package-json/v/wowissu/v-dragger) ![Bundle Size](https://img.shields.io/npm/dm/v-dragger) ![Vue](https://img.shields.io/badge/vue-3.x.x-green.svg)

Is only working on Vue3 for now. not Vue2.

```typescript
{
  trigger: string,
  onDragend: (indexMap: Record<number, number>) => void,
}
```

## Usage

```html
<ul>
  <li v-drag-item>1</li>
  <li v-drag-item>2</li>
  <li v-drag-item>3</li>
</ul>
```

### Group drag item

```html
<ul>
  <li v-drag-item:group1>group1-1</li>
  <li v-drag-item:group1>group1-2</li>
  <li v-drag-item:group1>group1-3</li>
  <li v-drag-item:group2>group2-4</li>
  <li v-drag-item:group2>group2-5</li>
  <li v-drag-item:group2>group2-6</li>
</ul>
```

## Set trigger

```html
<ul>
  <li v-drag-item><span v-drag-trigger>Drag me<span> 2</li>
  <li v-drag-item><span v-drag-trigger>Drag me<span> 1</li>
  <li v-drag-item><span v-drag-trigger>Drag me<span> 3</li>
</ul>
```

## Set trigger

```html
<ul>
  <li v-drag-item="{ trigger: '.trigger' }"><span class="trigger">Drag me<span> 2</li>
  <li v-drag-item="{ trigger: '.trigger' }"><span class="trigger">Drag me<span> 1</li>
  <li v-drag-item="{ trigger: '.trigger' }"><span class="trigger">Drag me<span> 3</li>
</ul>
```

## Event

```html
<ul>
  <li v-drag-item="onDragendCaller"></li>
  <li v-drag-item="onDragendCaller"></li>
  <li v-drag-item="onDragendCaller"></li>
</ul>

<script>
  export default {
    methods: {
      onDragendCaller(indexMap) {
        // 1 -> 2
        // 2 -> 1

        console.log(indexMap); // {0: 0, 1: 2, 2: 1, 3: 3, 4: 4}
      },
    },
  };
</script>
```

same as

```html
<ul>
  <li v-drag-item="{ onDragend: onDragendCaller }"></li>
  <li v-drag-item="{ onDragend: onDragendCaller }"></li>
  <li v-drag-item="{ onDragend: onDragendCaller }"></li>
</ul>
```
