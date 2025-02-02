<template>
  <div class="game-container">
    <div v-if="!gameStarted" class="start-screen">
      <h2>{{ mode === 'normal' ? '马批浓度测试器' : '马批浓度测试器 - 声优吃模式' }}</h2>
      <div class="settings" v-if="!gameStarted">
        <div class="checkbox-container">
          <div :class="{ disabled: settings.hardMode }">
            <label class="ios-checkbox green">
              <input type="checkbox" v-model="settings.random30" :disabled="settings.hardMode" />
              <div class="checkbox-wrapper">
                <div class="checkbox-bg"></div>
                <svg fill="none" viewBox="0 0 24 24" class="checkbox-icon">
                  <path stroke-linejoin="round" stroke-linecap="round" stroke-width="3" stroke="currentColor"
                    d="M4 12L10 18L20 6" class="check-path"></path>
                </svg>
              </div>
            </label>
            随机30个角色
          </div>
          <div :class="{ disabled: settings.hardMode }">
            <label class="ios-checkbox green">
              <input type="checkbox" v-model="settings.allowContinueOnError" :disabled="settings.hardMode" />
              <div class="checkbox-wrapper">
                <div class="checkbox-bg"></div>
                <svg fill="none" viewBox="0 0 24 24" class="checkbox-icon">
                  <path stroke-linejoin="round" stroke-linecap="round" stroke-width="3" stroke="currentColor"
                    d="M4 12L10 18L20 6" class="check-path"></path>
                </svg>
              </div>
            </label>
            不校验答案
          </div>
          <div>
            <label class="ios-checkbox green">
              <input type="checkbox" v-model="settings.hardMode" />
              <div class="checkbox-wrapper">
                <div class="checkbox-bg"></div>
                <svg fill="none" viewBox="0 0 24 24" class="checkbox-icon">
                  <path stroke-linejoin="round" stroke-linecap="round" stroke-width="3" stroke="currentColor"
                    d="M4 12L10 18L20 6" class="check-path"></path>
                </svg>
              </div>
            </label>
            高难度模式
          </div>
        </div>
      </div>
      <button @click="startGame">开始挑战</button>
    </div>

    <template v-else>

      <TimerDisplay v-if="gameStarted & displayTime & !settings.hardMode" :startTime="startTime" />

      <div v-if="gameStarted && currentCharacter" class="progress-container">
        <div class="progress-text">{{ progressText }}</div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{
            width: progressPercentage + '%',
            backgroundColor: subColor
          }"></div>
        </div>
      </div>

      <transition name="fade" mode="out-in">
        <div v-if="currentCharacter" key="game" class="character-card">
          <li class="charaContainer" style="transition-delay: 0s;"><a data-v-2ed22295="" data-v-edf74022=""
              class="charaALink" v-bind:style="{ '--color-main': mainColor, '--color-sub': subColor }">
              <div class="charaInner">
                <dl class="charaDl">
                  <dt class="charaDt">
                    <div class="dt-img">
                      <picture class="img-loaded">
                        <img :src="getImageUrl(currentCharacter.image)" :style="hardModeImageStyle" width="100%">
                      </picture>
                    </div>
                    <div class="dt-bg">
                      <p class="font-weight-bold">{{ settings.hardMode ? 'Umamusume' : mode === 'normal' ? 'Umamusume' :
                        currentCharacter.names.en }}</p>
                    </div>
                  </dt>
                  <dd class="charaDd">
                    <p class="name">
                    <div class="input-container" v-if="mode === 'normal'">
                      <div>
                        <input placeholder="中文名/日文名/英文名" class="input-field" type="text" v-model="userInput"
                          @keyup.enter="checkAnswer" :class="{ 'error-shake': isError }">
                        <label for="input-field" class="input-label"></label>
                        <span class="input-highlight" v-bind:style="{ 'background-color': subColor }"></span>
                      </div>
                    </div>
                    <div v-if="mode === 'seiyuu'">
                      <span class="masked-name">
                        {{ settings.hardMode ? maskName(currentCharacter.names.zh) : currentCharacter.names.zh }}
                      </span>
                    </div>
                    </p>
                    <div class="cv" v-if="mode === 'seiyuu'">
                      <p class="charaP">
                        <span class="charaSpan">CV:</span>
                        <input placeholder="中文名/日文名/英文名" class="input-field" type="text" v-model="userInput"
                          @keyup.enter="checkAnswer" :class="{ 'error-shake': isError }"
                          style="text-align: left; color: #505050;">
                        <label for="input-field" class="input-label"></label>
                        <span class="input-highlight" v-bind:style="{ 'background-color': subColor }"></span>
                      </p>
                    </div>
                  </dd>
                </dl>
              </div>
            </a>
          </li>
          <div class="button-container" v-bind:style="{ display: settings.allowContinueOnError ? 'block' : 'flex' }">
            <button v-if="!settings.allowContinueOnError" @click="skipCharacter" class="skip-button">跳过</button>
            <button @click="checkAnswer" class="submit-button">提交</button>
          </div>

          <div v-if="!settings.allowContinueOnError" class="hint-button" @click="showHint" :disabled="isHintDisabled">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
              <path fill="currentColor"
                d="M10.6 16q0-2.025.363-2.912T12.5 11.15q1.025-.9 1.563-1.562t.537-1.513q0-1.025-.687-1.7T12 5.7q-1.275 0-1.937.775T9.125 8.05L6.55 6.95q.525-1.6 1.925-2.775T12 3q2.625 0 4.038 1.463t1.412 3.512q0 1.25-.537 2.138t-1.688 2.012Q14 13.3 13.738 13.913T13.475 16zm1.4 6q-.825 0-1.412-.587T10 20t.588-1.412T12 18t1.413.588T14 20t-.587 1.413T12 22" />
            </svg>
          </div>
          <div v-if="showingHint" class="hint-popup" :class="{ show: showingHint }">
            {{ hintText }}
          </div>
          <div v-if="settings.hardMode && currentCharacter" class="hard-mode-timer">
            <div class="timer-circle">
              <svg width="40" height="40">
                <circle cx="20" cy="20" r="18" class="timer-bg" />
                <circle cx="20" cy="20" r="18" :style="{
                  strokeDasharray: `${2 * Math.PI * 18}`,
                  strokeDashoffset: `${2 * Math.PI * 18 * (1 - timeLeft / 10)}`,
                  stroke: mainColor
                }" class="timer-progress" />
              </svg>
              <div class="timer-text">{{ timeLeft }}</div>
            </div>
          </div>
        </div>

        <div v-else class="result-screen">
          <h3>{{ settings.hardMode ? '高难度模式' : '' }}挑战完成！</h3>
          <p>用时：{{ formattedTime }}</p>
          <p>正确率：{{ accuracy }}%</p>
          <p>正确数：{{ correctCount }}/{{ this.characters.length }}</p>

          <div class="error-list" v-if="errorStore.errorCount > 0">
            <h4>错误答案</h4>
            <div v-for="(error, index) in errorStore.errors" :key="index" class="error-item"
              :class="{ 'skipped': error.skipped }">
              <div class="error-card">
                <div class="error-image">
                  <img :src="getImageUrl(error.image)" width="60">
                </div>
                <div class="error-info">
                  <p v-if="error.mode === 'normal'">角色：{{ error.characterName }}</p>
                  <p>
                    你的答案：
                    <span class="wrong-answer" :data-skipped="error.skipped">
                      {{ error.skipped ? '（已跳过）' : (error.userAnswer || "（未填写）") }}
                    </span>
                  </p>
                  <p>正确答案：<span class="correct-answer">{{ error.correctAnswer }}</span></p>
                </div>
              </div>
            </div>
          </div>

          <div class="history-list">
            <h4>历史记录</h4>
            <div v-for="(record, index) in history.records" :key="index" class="history-item">
              <p>{{ formatDate(record.timestamp) }}</p>
              <p>模式：{{ record.mode === 'normal' ? '角色模式' : '声优模式' }}</p>
              <p>用时：{{ formatTime(record.time) }}</p>
              <p>正确率：{{ record.accuracy }}%</p>
              <p>正确数：{{ record.correctCount }}/{{ record.charaTotal }}</p>
            </div>
          </div>
        </div>
      </transition>
    </template>
  </div>
</template>

<script>
import TimerDisplay from '~/components/TimerDisplay.vue'
import { useGameStore, useErrorStore } from '~/store/index.js'
import { formatTime, formatDate } from '@/utils/helpers'
import { useHistoryStore } from '@/store/history.js'
import { useSettingsStore } from '@/store/setting.js'
import { useDebounceFn } from '@vueuse/core'

export default {
  setup() {
    const history = useHistoryStore()
    const settings = useSettingsStore()
    const errorStore = useErrorStore()
    return { history, settings, errorStore }
  },
  components: {
    TimerDisplay
  },
  props: {
    mode: {
      type: String,
      default: 'normal'
    }
  },
  data() {
    return {
      characters: [],
      currentIndex: 0,
      userInput: '',
      startTime: null,
      totalTime: null,
      stopTime: null,
      gameStarted: false,
      displayTime: true,
      correctCount: 0,
      isError: false,
      showingHint: false,
      hintText: '',
      timeoutId: null,
      timeLeft: 10,
      timerInterval: null
    }
  },
  computed: {
    currentCharacter() {
      return this.characters[this.currentIndex]
    },
    formattedTime() {
      return formatTime(this.totalTime)
    },
    accuracy() {
      return Math.round((this.correctCount / this.characters.length) * 100)
    },
    correctCount() {
      return this.correctCount
    },
    mainColor() {
      return this.applyOpacity(this.currentCharacter.mainColor, this.settings.hardMode ? 0.5 : 1)
    },
    subColor() {
      return this.applyOpacity(this.currentCharacter.subColor, this.settings.hardMode ? 0.5 : 1)
    },
    progressPercentage() {
      return ((this.currentIndex + 1) / this.characters.length) * 100
    },
    progressText() {
      return `${this.currentIndex + 1}/${this.characters.length}`
    },
    hardModeImageStyle() {
      return {
        filter: this.settings.hardMode ? 'blur(14px) contrast(350%)' : 'none',
        opacity: 1
      }
    }
  },
  methods: {
    async startGame() {
      const nuxtApp = useNuxtApp()
      this.characters = await nuxtApp.$dataLoader.loadCharacters()
      if (this.characters.length === 0) return

      this.shuffleCharacters()

      if (this.settings.random30) {
        this.characters = this.characters.slice(0, 30)
      }

      this.gameStarted = true
      this.displayTime = true
      this.errorStore.clearErrors()
      this.startTime = Date.now()
    },
    getImageUrl(imageName) {
      if (!this.settings.hardMode) {
        return new URL(`/assets/images/characters/syoubufuku/${imageName}`, import.meta.url).href
      } else {
        return new URL(`/assets/images/characters/seifuku/${imageName}`, import.meta.url).href
      }
    },
    shuffleCharacters() {
      for (let i = this.characters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
          ;[this.characters[i], this.characters[j]] =
            [this.characters[j], this.characters[i]]
      }
    },
    checkAnswer: useDebounceFn(function () {
      if (this.settings.hardMode && this.timeLeft <= 0) return

      const validAnswers = this.getValidAnswers()
      const userAnswer = this.userInput.trim()

      if (validAnswers.includes(userAnswer.toLowerCase())) {
        this.correctCount++
        this.nextCharacter()
      } else {
        this.handleWrongAnswer(userAnswer)
      }
    }, 300),
    handleError() {
      if (this.settings.allowContinueOnError) {
        this.nextCharacter()
      } else {
        this.isError = true
        setTimeout(() => this.isError = false, 1000)
      }
    },
    nextCharacter() {
      clearInterval(this.timerInterval)
      this.showingHint = false
      this.isHintDisabled = false

      if (this.currentIndex < this.characters.length - 1) {
        this.currentIndex++
        this.userInput = ''
        this.preloadNextImage()
        this.startTimer()
      } else {
        this.endGame()
      }
    },
    endGame() {
      this.displayTime = false
      this.totalTime = Date.now() - this.startTime
      this.currentCharacter = null

      this.currentIndex = this.characters.length

      clearInterval(this.timerInterval)
      this.timeLeft = 0

      const gameStore = useGameStore()
      gameStore.addHistory({
        mode: this.mode,
        time: this.totalTime,
        date: new Date().toISOString(),
      })

      this.history.addRecord({
        mode: this.mode,
        time: this.totalTime,
        accuracy: this.accuracy,
        correctCount: this.correctCount,
        charaTotal: this.characters.length
      })
    },
    restartGame() {
      this.gameStarted = false
      this.displayTime = true
      this.currentIndex = 0
      this.userInput = ''
      this.correctCount = 0
    },
    showHint() {
      if (this.isHintDisabled) return

      const targetName = this.mode === 'normal'
        ? this.currentCharacter.names
        : this.currentCharacter.seiyuu

      const nameToUse = targetName.zh

      const randomChars = nameToUse.split('').sort(() => 0.5 - Math.random()).slice(0, 2).join('')

      let hintText = ''
      for (let i = 0; i < nameToUse.length; i++) {
        if (randomChars.includes(nameToUse[i])) {
          hintText += nameToUse[i]
        } else {
          hintText += ' _ '
        }
      }

      this.hintText = hintText
      this.showingHint = true
      this.isHintDisabled = true
    },
    skipCharacter() {
      this.errorStore.addError({
        userAnswer: '',
        correctAnswer: this.mode === 'normal' ?
          `${this.currentCharacter.names.zh} (${this.currentCharacter.names.jp})` :
          `${this.currentCharacter.seiyuu.zh} (${this.currentCharacter.seiyuu.jp})`,
        image: this.currentCharacter.image,
        characterName: this.currentCharacter.names.zh,
        mode: this.mode,
        skipped: true
      })

      this.nextCharacter()
    },
    preloadNextImage() {
      const startIndex = this.currentIndex + 1
      const endIndex = Math.min(startIndex + 10, this.characters.length)

      for (let i = startIndex; i < endIndex; i++) {
        const character = this.characters[i];
        const img = new Image();
        img.src = this.getImageUrl(character.image)
      }
    },
    handleHardModeChange() {
      if (this.settings.hardMode) {
        this.settings.random30 = true
        this.settings.allowContinueOnError = true
      }
    },

    applyOpacity(hex, opacity) {
      if (!hex) return ''
      let r = 0, g = 0, b = 0
      if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16)
        g = parseInt(hex[2] + hex[2], 16)
        b = parseInt(hex[3] + hex[3], 16)
      } else if (hex.length === 7) {
        r = parseInt(hex[1] + hex[2], 16)
        g = parseInt(hex[3] + hex[4], 16)
        b = parseInt(hex[5] + hex[6], 16)
      }
      return `rgba(${r},${g},${b},${opacity})`
    },

    startTimer() {
      if (!this.settings.hardMode) return

      this.timeLeft = 10
      this.timerInterval = setInterval(() => {
        this.timeLeft--
        if (this.timeLeft <= 0) {
          this.handleTimeout()
        }
      }, 1000)
    },

    handleTimeout() {
      this.errorStore.addError({
        userAnswer: '（超时）',
        correctAnswer: this.getCorrectAnswer(),
        image: this.currentCharacter.image,
        characterName: this.currentCharacter.names.zh,
        mode: this.mode,
        skipped: false
      })
      this.nextCharacter()
    },

    getCorrectAnswer() {
      return this.mode === 'normal'
        ? `${this.currentCharacter.names.zh} (${this.currentCharacter.names.jp})`
        : `${this.currentCharacter.seiyuu.zh} (${this.currentCharacter.seiyuu.jp})`
    },

    getValidAnswers() {
      const target = this.mode === 'normal'
        ? this.currentCharacter.names
        : this.currentCharacter.seiyuu

      return [
        target.jp,
        target.zh,
        target.en,
        ...(target.aliases || []),
      ].map(str => str.toLowerCase().trim())
    },

    handleWrongAnswer(userAnswer) {
      this.errorStore.addError({
        userAnswer,
        correctAnswer: this.getCorrectAnswer(),
        image: this.currentCharacter.image,
        characterName: this.currentCharacter.names.zh,
        mode: this.mode,
        skipped: false
      })

      if (this.settings.allowContinueOnError) {
        this.nextCharacter()
      } else {
        this.isError = true
        setTimeout(() => this.isError = false, 1000)
      }
    }
  },

  watch: {
    'settings.hardMode'(newVal) {
      if (newVal) {
        this.settings.random30 = true
        this.settings.allowContinueOnError = true
      }
    }
  }
}
</script>


<style scoped>
:root {
  --color-text-base: #4d4d4d;
  --color-text-gray: #141414;
  --color-gray: #d2d2d2;
  --color-blue: #2a5dfa;
  --color-green: #69c832;
  --color-yellow: #ffba00;
  --color-orange: #ff9600;
  --color-error: red
}

@media (orientation : portrait) {
  .charaContainer {
    width: 27.3333333333vh !important;
    height: 44vh !important;
  }

  .charaDl {
    height: 42.9333333333vh !important;
    width: 26.2666666667vh !important;
  }

  .dt-img {
    height: 34.4vh !important;
  }

  .font-weight-bold {
    font-size: 2.8vh !important;
    margin-top: 1.0666666667vh !important;
  }

  .font-weight-bold {
    font-size: 2.8vh !important;
    margin-top: 1.0666666667vh !important;
  }

  .charaDd {
    padding-left: 2vh !important;
  }

  .name {
    font-size: 2.3vh !important;
  }

  .cv {
    font-size: 2.4vh !important;
    margin-top: .9333333333vh !important;
  }

  .charaP {
    font-size: 1.8vh !important;
  }

  a dl dt .dt-bg:before {
    height: 30vh !important;
    width: 21.7333333333vh !important;
  }

  a dl dd:before {
    width: .9333333333vh !important;
  }

  .rusult-screen {
    width: 90vw !important;
  }
}

/* 纯抄袭官网，实在懒得细改了 */
.charaContainer {
  -webkit-text-size-adjust: 100%;
  -webkit-tap-highlight-color: transparent;
  --vh: 8.34px;
  font-family: YakuHanJP, Roboto, Zen Kaku Gothic New, sans-serif;
  font-weight: 500;
  line-height: 1;
  color: var(--color-text-gray);
  list-style: none;
  border-style: solid;
  border-width: 0;
  box-sizing: border-box;
  transition: transform .7s cubic-bezier(.19, 1, .22, 1), opacity .7s cubic-bezier(.165, .84, .44, 1);
  height: 44vw;
  margin: auto;
  width: 27.3333333333vw;
  opacity: 1;
  transform: translateY(0) translateZ(0);
  transition-delay: 0s;
}

.charaALink {
  -webkit-text-size-adjust: 100%;
  --vh: 8.34px;
  font-family: YakuHanJP, Roboto, Zen Kaku Gothic New, sans-serif;
  font-weight: 500;
  line-height: 1;
  list-style: none;
  border-style: solid;
  border-width: 0;
  box-sizing: border-box;
  color: inherit;
  text-decoration: none;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  --color-btn: var(--color-main);
  background-color: var(--color-sub);
  filter: drop-shadow(var(--xpos) var(--ypos) var(--blur) rgba(0, 0, 0, .2));
  height: 100%;
  width: 100%;
  --xpos: 0;
  --ypos: .4vw;
  --blur: .6666666667vw;
  display: block;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.charaInner,
.charaDl,
.charaDt,
.dt-img,
.img-loaded,
.dt-bg,
.font-weight-bold,
.charaDd,
.name,
.cv,
.charaP,
.charaSpan {
  -webkit-text-size-adjust: 100%;
  --vh: 8.34px;
  border-style: solid;
  border-width: 0;
  box-sizing: border-box;
}

.charaInner,
.charaDl,
.charaDt,
.dt-img,
.img-loaded,
.dt-bg {
  font-family: YakuHanJP, Roboto, Zen Kaku Gothic New, sans-serif;
  line-height: 1;
  list-style: none;
  color: inherit;
  -webkit-tap-highlight-color: transparent;
  --color-btn: var(--color-main);
  --xpos: 0;
  --ypos: .4vw;
  --blur: .6666666667vw;
}

.charaInner {
  font-weight: 500;
  height: 100%;
}

.charaDl {
  margin: 0;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  position: relative;
  height: 42.9333333333vw;
  width: 26.2666666667vw;
  transform: translateZ(0);
  transition: transform .3s cubic-bezier(.165, .84, .44, 1);
}

.charaDt {
  font-weight: inherit;
}

.dt-img {
  object-fit: cover;
  overflow: hidden;
  position: relative;
  z-index: 2;
  height: 34.4vw;
}

.img-loaded {
  display: block;
}

.dt-bg {
  display: flex;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 1;
}

.font-weight-bold {
  margin: 0;
  font-weight: 700;
  font-family: midasi-w, Raleway, sans-serif;
  letter-spacing: .05em;
  align-items: center;
  color: var(--color-main);
  display: flex;
  flex: auto;
  writing-mode: vertical-rl;
  font-size: 2.8vw;
  margin-top: 1.0666666667vw;
}

.charaDd {
  font-family: YakuHanJP, Roboto, Zen Kaku Gothic New, sans-serif;
  font-weight: 500;
  margin-left: 0;
  border-top: 1px solid var(--color-main);
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  position: relative;
  z-index: 10;
  padding-left: 2vw;
  align-items: start;
}

.name {
  margin: 0;
  font-weight: 700;
  letter-spacing: -.05em;
  font-size: 2.3vw;
}

.cv {
  color: #505050;
  height: 1em;
  font-size: 2.4vw;
  margin-top: .9333333333vw;
  display: inline-block;
}

.charaP {
  color: #505050;
  font-size: 1.8vw;
  margin: 0;
}

.charaSpan {
  font-family: midasi-w, Raleway, sans-serif;
  letter-spacing: .05em;
  margin-left: .1em;
  margin-right: .1em;
  display: inline-block;
}

a dl dt .dt-bg:before {
  background-color: var(--color-main);
  content: "";
  display: block;
}

a dl dt .dt-bg:before {
  height: 30vw;
  width: 21.7333333333vw;
}

a dl dd:before {
  width: .9333333333vw;
}

a dl dd:before {
  background-color: var(--color-main);
  content: "";
  display: block;
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
}

*,
:after,
:before {
  border-style: solid;
  border-width: 0;
  box-sizing: border-box;
}

a dl:after {
  border: 1px solid var(--color-main);
  content: "";
  display: block;
  height: 100%;
  left: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 10;
}

.progress-container {
  margin: 20px auto;
  max-width: 600px;
  padding: 0 15px;
}

.progress-bar {
  height: 12px;
  background-color: #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.progress-text {
  text-align: center;
  margin-bottom: 8px;
  font-size: 1.1em;
  color: var(--color-text-gray);
  font-weight: bold;
}

@media (max-width: 768px) {
  .progress-container {
    margin: 15px 10px;
  }

  .progress-bar {
    height: 10px;
  }

  .progress-text {
    font-size: 0.9em;
  }
}

.hint-button {
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: #f8fafc;
  color: #505050;
  font-size: 2rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.15),
    0 2px 4px -2px rgba(0, 0, 0, 0.08);
  z-index: 10;
}

.hint-popup.show {
  opacity: 1;
}

.hint-popup {
  position: fixed;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  max-width: 300px;
  margin: auto;
  margin-bottom: 5px;
  gap: 20px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 16px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.15),
    0 2px 4px -2px rgba(0, 0, 0, 0.08);
  opacity: 0;
  transition: opacity 0.5s ease;
  z-index: 100;
}

.button-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.skip-button {
  margin-right: 10px;
  background-color: white;
  color: #8c83ff;
}

.submit-button {
  background-color: #8c83ff;
  color: white;
}

.error-list {
  margin-top: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.error-item {
  background: #fff;
  border-radius: 12px;
  margin: 1rem 0;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #ff4444;
}

.error-card {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.error-image img {
  border-radius: 8px;
  border: 2px solid #eee;
}

.error-info p {
  margin: 0.5rem 0;
  font-size: 0.95rem;
}

.wrong-answer {
  color: #ff4444;
  text-decoration: line-through;
}

.correct-answer {
  color: #00c851;
  font-weight: bold;
}

.wrong-answer[data-skipped]::before {
  color: #999;
}

.error-item.skipped {
  background-color: #f8f9fa;
  border-left: 4px solid #6c757d;
}

.error-item.skipped .wrong-answer {
  color: #6c757d;
}

@media (max-width: 768px) {
  .error-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .error-image img {
    width: 50px;
  }
}

.hard-mode-timer {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 100;
}

.timer-circle {
  right: 20px;
  top: 20px;
  position: fixed;
  width: 40px;
  height: 40px;
}

.timer-bg {
  fill: none;
  stroke: #eee;
  stroke-width: 2;
}

.timer-progress {
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
  transition: stroke-dashoffset 1s linear;
}

.timer-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: bold;
  color: var(--color-text-gray);
}

.disabled {
  opacity: 0.6;
  pointer-events: none;
}

.cv .masked-name {
  letter-spacing: 2px;
  filter: blur(1px);
}
</style>
