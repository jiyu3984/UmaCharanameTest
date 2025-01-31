<template>
  <div class="game-container">
    <div v-if="!gameStarted" class="start-screen">
      <h2>{{ mode === 'normal' ? '马批浓度测试器' : '马批浓度测试器 - 声优吃模式' }}</h2>
      <div class="settings" v-if="!gameStarted">
        <div class="checkbox-container">
          <div><label class="ios-checkbox green">
              <input type="checkbox" v-model="settings.random30" />
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
          <div>
            <label class="ios-checkbox green">
              <input type="checkbox" v-model="settings.allowContinueOnError" />
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
        </div>
      </div>
      <button @click="startGame">开始挑战</button>
    </div>

    <template v-else>

      <TimerDisplay v-if="gameStarted & displayTime" :startTime="startTime" />

      <transition name="fade" mode="out-in">
        <div v-if="currentCharacter" key="game" class="character-card">
          <li class="charaContainer" style="transition-delay: 0s;"><a data-v-2ed22295="" data-v-edf74022=""
              class="charaALink" v-bind:style="{ '--color-main': mainColor, '--color-sub': subColor }">
              <div class="charaInner">
                <dl class="charaDl">
                  <dt class="charaDt">
                    <div class="dt-img">
                      <picture class="img-loaded">
                        <img :src="getImageUrl(currentCharacter.image)" width="100%">
                      </picture>
                    </div>
                    <div class="dt-bg">
                      <p class="font-weight-bold">{{ mode === 'normal' ? 'Umamusume' : currentCharacter.names.en }}</p>
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
                      {{ currentCharacter.names.zh }}
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
          <button @click="checkAnswer" class="submit-button">提交</button>
        </div>

        <div v-else class="result-screen">
          <h3>挑战完成！</h3>
          <p>用时：{{ formattedTime }}</p>
          <p v-if="this.settings.allowContinueOnError">正确率：{{ accuracy }}%</p>
          <p>正确数：{{ correctCount }}/{{ this.characters.length }}</p>
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
import { useGameStore } from '~/store/index.js'
import { formatTime, formatDate } from '@/utils/helpers'
import { useHistoryStore } from '@/store/history.js'
import { useSettingsStore } from '@/store/setting.js'

export default {
  setup() {
    const history = useHistoryStore()
    const settings = useSettingsStore()
    return { history, settings }
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
      isError: false
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
      return this.currentCharacter.mainColor;
    },
    subColor() {
      return this.currentCharacter.subColor;
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
      this.startTime = Date.now()
    },
    getImageUrl(imageName) {
      return new URL(`/assets/images/characters/${imageName}`, import.meta.url).href
    },
    shuffleCharacters() {
      for (let i = this.characters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
          ;[this.characters[i], this.characters[j]] =
            [this.characters[j], this.characters[i]]
      }
    },
    checkAnswer() {
      const target = this.mode === 'normal'
        ? this.currentCharacter.names
        : this.currentCharacter.seiyuu

      const validAnswers = [
        target.jp,
        target.zh,
        target.en,
        ...(target.aliases || [])
      ].map(str => str.toLowerCase().trim())

      if (validAnswers.includes(this.userInput.toLowerCase().trim())) {
        this.correctCount++
        this.nextCharacter()
      } else {
        this.handleError()
      }
    },
    handleError() {
      if (this.settings.allowContinueOnError) {
        this.nextCharacter()
      } else {
        this.isError = true
        setTimeout(() => this.isError = false, 1000)
      }
    },
    nextCharacter() {
      if (this.currentIndex < this.characters.length - 1) {
        this.currentIndex++
        this.userInput = ''
      } else {
        this.endGame()
      }
    },
    endGame() {
      this.displayTime = false
      this.totalTime = Date.now() - this.startTime

      this.currentIndex = this.characters.length

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
</style>
