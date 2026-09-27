import './ResultsPanel.css';
import panelFrame from './assets/banal.png';
import coinsImage from './assets/money.png';
import correctImage from './assets/right.png';
import wrongImage from './assets/wrong.png';
import buttonFrame from './assets/boutton.png';
import retryIconImg from '../assets/retry.png';
import exitIconImg from '../assets/ExitButton.svg';

const numberValue = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : 0;
};

export class ResultsPanel {
  constructor(root, options = {}) {
    this.root = root;
    this.onRetry = options.onRetry;
    this.onBack = options.onBack;
    this.#build();
  }

  #build() {
    this.el = document.createElement("div");
    this.el.className = "results-overlay";

    const screen = document.createElement("section");
    screen.className = "results-screen";
    screen.setAttribute("aria-label", "نتائج اللعبة");
    screen.dir = "rtl";

    const panel = document.createElement("div");
    panel.className = "results-panel";
    panel.style.setProperty("--results-panel-image", `url(${panelFrame})`);

    const content = document.createElement("div");
    content.className = "results-panel__content";

    this.titleText = document.createElement("h2");
    this.titleText.className = "results-panel__title-text";

    const stats = document.createElement("div");
    stats.className = "results-stats";
    stats.setAttribute("aria-label", "إحصاءات الأداء");

    const correctCard = document.createElement("div");
    correctCard.className = "results-stat-card results-stat-card--correct";
    const correctImg = document.createElement("img");
    correctImg.src = correctImage;
    correctImg.alt = "إجابات صحيحة";
    this.correctText = document.createElement("strong");
    correctCard.append(correctImg, this.correctText);

    const coinsCard = document.createElement("div");
    coinsCard.className = "results-stat-card results-stat-card--coins";
    const coinsImg = document.createElement("img");
    coinsImg.src = coinsImage;
    coinsImg.alt = "عملات مكتسبة";
    this.coinsText = document.createElement("strong");
    const coinsLabel = document.createElement("span");
    coinsLabel.textContent = "فِلُوس";
    coinsCard.append(coinsImg, this.coinsText, coinsLabel);

    const wrongCard = document.createElement("div");
    wrongCard.className = "results-stat-card results-stat-card--wrong";
    const wrongImg = document.createElement("img");
    wrongImg.src = wrongImage;
    wrongImg.alt = "إجابات خاطئة";
    this.wrongText = document.createElement("strong");
    wrongCard.append(wrongImg, this.wrongText);

    stats.append(correctCard, coinsCard, wrongCard);
    content.append(this.titleText, stats);
    panel.append(content);

    const actions = document.createElement("div");
    actions.className = "results-actions";

    const backBtn = document.createElement("button");
    backBtn.className = "results-action results-action--back";
    backBtn.type = "button";
    backBtn.onclick = () => { if (this.onBack) this.onBack(); };
    const backBtnImg = document.createElement("img");
    backBtnImg.src = buttonFrame;
    backBtnImg.alt = "";
    backBtnImg.setAttribute("aria-hidden", "true");
    const backGrp = document.createElement("span");
    backGrp.className = "results-action__group flex-column-center";
    const backIcon = document.createElement("img");
    backIcon.className = "results-action__custom-icon";
    backIcon.src = exitIconImg;
    const backTxt = document.createElement("span");
    backTxt.textContent = "اخرج";
    backGrp.append(backIcon, backTxt);
    backBtn.append(backBtnImg, backGrp);

    const retryBtn = document.createElement("button");
    retryBtn.className = "results-action results-action--retry";
    retryBtn.type = "button";
    retryBtn.onclick = () => { if (this.onRetry) this.onRetry(); };
    const retryBtnImg = document.createElement("img");
    retryBtnImg.src = buttonFrame;
    retryBtnImg.alt = "";
    retryBtnImg.setAttribute("aria-hidden", "true");
    const retryGrp = document.createElement("span");
    retryGrp.className = "results-action__group flex-column-center";
    const retryIcon = document.createElement("img");
    retryIcon.className = "results-action__custom-icon";
    retryIcon.src = retryIconImg;
    const retryTxt = document.createElement("span");
    retryTxt.textContent = "ثانيه";
    retryGrp.append(retryIcon, retryTxt);
    retryBtn.append(retryBtnImg, retryGrp);

    actions.append(backBtn, retryBtn);
    screen.append(panel, actions);
    this.el.append(screen);
  }

  show(data = {}) {
    const finalScore = numberValue(data.score);
    const maximumScore = numberValue(data.totalScore) || 100;
    const correct = numberValue(data.correctAnswers);
    const wrong = numberValue(data.wrongAnswers);
    const earnedCoins = numberValue(data.coins);

    this.correctText.textContent = correct;
    this.wrongText.textContent = wrong;
    this.coinsText.textContent = `+${earnedCoins}`;

    if (correct > wrong) {
      this.titleText.textContent = "أحسنت";
      this.titleText.style.color = "#22c55e";
    } else {
      this.titleText.textContent = "حاول مره اخري";
      this.titleText.style.color = "#ef4444";
    }

    this.root.appendChild(this.el);
  }

  hide() {
    this.el.remove();
  }
}
