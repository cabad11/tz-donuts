const SHIFT_PER_PACK = 95;

const donutsCount = document.querySelectorAll('.donut').length;
const containerSize = 2;

const state = {
  collected: 0,
  clickMuted: false,
  activeContainer: document.querySelector('.donutContainer'),
};

const fadeOutAnimation = (el) => el.animate([{opacity: '1'}, {opacity: '0'}], {
      duration: 500,
      easing: 'ease-in',
      fill: 'forwards'
    });

const fadeInAnimation = (el) => el.animate([{opacity: '0'}, {opacity: '1'}], {
      duration: 500,
      easing: 'ease-in',
      fill: 'forwards'
    });

const createDonutContainer = () =>{
  const result = document.createElement('div');
  result.className ='donutContainer';
  result.innerHTML='<div class="cap"></div>'
  fadeInAnimation(result)
  return result
}

const goToQuestionStep = () => {
  const titleBlock = document.querySelector('.titleBlock')
  fadeOutAnimation(titleBlock).onfinish=()=>titleBlock.classList.add('hidden')
  const [questionsBlock, doneButton, input] = [document.querySelector('.questionBlock'), document.querySelector('.doneButton'), document.querySelector('.questionBlock input')]
  questionsBlock.classList.remove('hidden');
  doneButton.classList.remove('hidden');
  fadeInAnimation(questionsBlock);
  fadeInAnimation(doneButton);

  input.addEventListener('keypress', (e)=>{
    if (!e.key.match(/[0-9]/)) {
      e.preventDefault();
      return;
    }
  })

  input.addEventListener('input', (e)=>{
    doneButton.disabled = !(Number(input.value) > 0);
  })

  doneButton.addEventListener('click', ()=>{
    if (+input.value === donutsCount){
        questionsBlock.classList.remove('error');
        doneButton.classList.remove('error');
        questionsBlock.classList.add('success');
        doneButton.classList.add('success');
        input.disabled = true
    } else {
        Array.from(document.querySelectorAll('.donut')).reduce(async(acc, el, index)=>{
          await acc;
          el.dataset.number = index + 1
          return new Promise((resolve)=>setTimeout(resolve,500))
        },Promise.resolve())      
        questionsBlock.classList.add('error');
        doneButton.classList.add('error');
    }
  })
}

let donutsContainerRaw = document.querySelector('.donutContainerRaw');
const handleDonutClick = (e) => {
  if (e.type === 'keydown' && !['Enter', ' '].includes(e.key)) return;
  if (e.type === 'keydown') e.preventDefault();
  const target = e.target.closest('.donut:not(.donutSelected)')
  if (!target || state.clickMuted) return;
  const donutRect = target.getBoundingClientRect();
  target.classList.add('donutSelected');
  target.setAttribute('aria-hidden', 'true');

  state.activeContainer.append(target);
  requestAnimationFrame(()=>{
    const targetRect = target.getBoundingClientRect();

    target.animate([
      { 
        transform: `translate(${donutRect.left - targetRect.left}px, ${donutRect.top - targetRect.top}px)`
      },
      { 
        transform: 'translate(0, 0)'
      }
    ], {
      duration: 500,
      easing: 'ease-in',
      fill: 'forwards'
    });
  })

  state.collected++;

  if (state.collected % containerSize !== 0) return;
  state.clickMuted = true;
  setTimeout(()=>{
    state.activeContainer.classList.add('donutContainerClosed');
    setTimeout(()=>{
      state.clickMuted = false;
    }, 1000);

    if(state.collected === donutsCount) {
      goToQuestionStep()
      return
    }
    donutsContainerRaw.style.transform = `translateX(-${SHIFT_PER_PACK*(state.collected/containerSize)}px)`;
    state.activeContainer = createDonutContainer();
    donutsContainerRaw.append(state.activeContainer);
  }, 500);
}


const setup = () =>{
  document.getElementById('container').addEventListener('click', handleDonutClick);
  document.getElementById('container').addEventListener('keydown', handleDonutClick);
}

setup()