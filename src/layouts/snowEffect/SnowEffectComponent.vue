<template>
  <div>
    <div id="snow" style="overflow-y: hidden"></div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'

let snowflakesCount = 50 // Snowflake count, can be overwritten by attrs
const baseCSS = `
.snowflake {
    position: absolute;
    width: 10px;
    height: 10px;
    background: grey;
    border-radius: 50%;
    filter: drop-shadow(0 0 10px white);
}
`

let bodyHeightPx = null
let pageHeightVh = null

function setHeightVariables () {
  bodyHeightPx = document.body.offsetHeight - 100
  pageHeightVh = (100 * bodyHeightPx) / window.innerHeight
}

// get params set in snow div
function getSnowAttributes () {
  const snowWrapper = document.getElementById('snow')
  snowflakesCount = Number(snowWrapper?.dataset?.count || snowflakesCount)
}

// Creating snowflakes
function generateSnow (snowDensity = 200) {
  snowDensity -= 1
  const snowWrapper = document.getElementById('snow')
  snowWrapper.innerHTML = ''
  for (let i = 0; i < snowDensity; i++) {
    const board = document.createElement('div')
    board.className = 'snowflake'
    snowWrapper.appendChild(board)
  }
}

function getOrCreateCSSElement () {
  let cssElement = document.getElementById('psjs-css')
  if (cssElement) return cssElement

  cssElement = document.createElement('style')
  cssElement.id = 'psjs-css'
  document.head.appendChild(cssElement)
  return cssElement
}

// Append style for each snowflake to the head
function addCSS (rule) {
  const cssElement = getOrCreateCSSElement()
  cssElement.innerHTML = rule // safe to use innerHTML
  document.head.appendChild(cssElement)
}

// Math
function randomInt (value = 100) {
  return Math.floor(Math.random() * value) + 1
}

function randomIntRange (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomArbitrary (min, max) {
  return Math.random() * (max - min) + min
}

// Create style for snowflake
function generateSnowCSS (snowDensity = 200) {
  const snowflakeName = 'snowflake'
  let rule = baseCSS

  for (let i = 1; i < snowDensity; i++) {
    const randomX = Math.random() * 60 // vw
    const randomOffset = Math.random() * 10 // vw;
    const randomXEnd = randomX + randomOffset
    const randomXEndYoyo = randomX + randomOffset / 2
    const randomYoyoTime = getRandomArbitrary(0.3, 0.8)
    const randomYoyoY = randomYoyoTime * pageHeightVh // vh
    const randomScale = Math.random()
    const fallDuration = randomIntRange(10, (pageHeightVh / 10) * 3) // s
    const fallDelay = randomInt((pageHeightVh / 10) * 3) * -1 // s
    const opacity = Math.random()

    rule += `
      .${snowflakeName}:nth-child(${i}) {
        opacity: ${opacity};
        transform: translate(${randomX}vw, -10px) scale(${randomScale});
        animation: fall-${i} ${fallDuration}s ${fallDelay}s linear infinite;
      }
      @keyframes fall-${i} {
        ${randomYoyoTime * 100}% {
          transform: translate(${randomXEnd}vw, ${randomYoyoY}vh) scale(${randomScale});
        }
        to {
          transform: translate(${randomXEndYoyo}vw, ${pageHeightVh}vh) scale(${randomScale});
        }
      }
    `
  }
  addCSS(rule)
}

// Load the rules and execute after the DOM loads
function createSnow () {
  setHeightVariables()
  getSnowAttributes()
  generateSnowCSS(snowflakesCount)
  generateSnow(snowflakesCount)
}

onUnmounted(() => {
  window.removeEventListener('resize', createSnow)
})

onMounted(() => {
  window.addEventListener('resize', createSnow)
  createSnow()
})
</script>
