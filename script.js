const SHIFT_PER_PACK = 95;
const CONTAINER_SIZE = 2;
const PACK_ANIMATION_DURATION = 500;


const donutsCount = document.querySelectorAll(".donut").length;
const closeAnimationDuration = parseInt(
  getComputedStyle(document.body).getPropertyValue(
    "--container-close-animation-duration",
  ),
);

const state = {
  collected: 0,
  clickMuted: false,
  activeContainer: document.querySelector(".donutContainer"),
};

const fadeOutAnimation = (el, duration = 500) =>
  el.animate([{ opacity: "1" }, { opacity: "0" }], {
    duration,
    easing: "ease-in",
    fill: "forwards",
  });

const fadeInAnimation = (el, duration = 500) =>
  el.animate([{ opacity: "0" }, { opacity: "1" }], {
    duration,
    easing: "ease-in",
    fill: "forwards",
  });

const donutPackAnimation = (el, oldPostition, newPosition) =>
  el.animate(
    [
      {
        transform: `translate(${oldPostition.left - newPosition.left}px, ${oldPostition.top - newPosition.top}px)`,
      },
      {
        transform: "translate(0, 0)",
      },
    ],
    {
      duration: PACK_ANIMATION_DURATION,
      easing: "ease-in",
      fill: "forwards",
    },
  );

const createDonutContainer = () => {
  const container = document.createElement("div");
  container.className = "donutContainer";
  container.innerHTML = '<div class="cap"></div>';
  const animation = fadeInAnimation(container, 1000);
  return { container, animation };
};

const goToQuestionStep = () => {
  const titleBlock = document.querySelector(".titleBlock");
  fadeOutAnimation(titleBlock).onfinish = () =>
    titleBlock.classList.add("hidden");

  const [questionsBlock, doneButton] = [
    document.querySelector(".questionBlock"),
    document.querySelector(".doneButton"),
  ];

  questionsBlock.classList.remove("hidden");
  doneButton.classList.remove("hidden");
  fadeInAnimation(questionsBlock);
  fadeInAnimation(doneButton);
};

let donutsContainerRaw = document.querySelector(".donutContainerRaw");
const handleDonutClick = (e) => {
  if (e.type === "keydown" && !["Enter", " "].includes(e.key)) return;
  if (e.type === "keydown") e.preventDefault();

  const donut = e.target.closest(".donut:not(.donutSelected)");
  if (!donut || state.clickMuted) return;

  const oldPostition = donut.getBoundingClientRect();

  donut.classList.add("donutSelected");
  donut.setAttribute("aria-hidden", "true");

  state.activeContainer.append(donut);
  requestAnimationFrame(() => {
    const newPosition = donut.getBoundingClientRect();

    donutPackAnimation(donut, oldPostition, newPosition);
  });

  state.collected++;

  if (state.collected % CONTAINER_SIZE !== 0) return;
  state.clickMuted = true;

  setTimeout(() => {
    state.activeContainer.classList.add("donutContainerClosed");

    if (state.collected === donutsCount) {
      goToQuestionStep();
      return;
    }

    donutsContainerRaw.style.transform = `translateX(-${SHIFT_PER_PACK * (state.collected / CONTAINER_SIZE)}px)`;

    setTimeout(() => {
      const { container, animation } = createDonutContainer();
      state.activeContainer = container
      donutsContainerRaw.append(state.activeContainer);
      animation.onfinish = () => {
        state.clickMuted = false;
      }
    }, closeAnimationDuration);
  }, PACK_ANIMATION_DURATION);
};

const handleInputKeyPress = (e) => {
  if (!e.key.match(/[0-9]/)) {
    e.preventDefault();
    return;
  }
};

const handleInput = (e) => {
  document.querySelector(".doneButton").disabled = e.target.value === '';
};

const handleDoneClick = () => {
  const [questionsBlock, doneButton, input] = [
    document.querySelector(".questionBlock"),
    document.querySelector(".doneButton"),
    document.querySelector(".questionBlock input"),
  ];
  const isSuccess = +input.value === donutsCount;

  questionsBlock.classList.toggle("error", !isSuccess);
  doneButton.classList.toggle("error", !isSuccess);
  questionsBlock.classList.toggle("success", isSuccess);
  doneButton.classList.toggle("success", isSuccess);

  if (isSuccess) {
    input.disabled = true;
  } else {
    Array.from(document.querySelectorAll(".donut")).reduce(
      async (acc, el, index) => {
        await acc;
        el.dataset.number = index + 1;
        return new Promise((resolve) => setTimeout(resolve, 500));
      },
      Promise.resolve(),
    );
  }
};

const setup = () => {
  const container = document.getElementById("container");
  const input = document.querySelector(".questionBlock input");
  const doneButton = document.querySelector(".doneButton");

  container.addEventListener("click", handleDonutClick);
  container.addEventListener("keydown", handleDonutClick);
  input.addEventListener("keypress", handleInputKeyPress);
  input.addEventListener("input", handleInput);
  doneButton.addEventListener("click", handleDoneClick);
};

setup();
