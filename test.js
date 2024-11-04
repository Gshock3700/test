document.querySelectorAll('.tab-btn').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    document.querySelectorAll('.tab-content').forEach(content => {
      content.style.display = 'none';
    });
    document.getElementById(button.dataset.tab).style.display = 'block';
  });
});

let timeLeft = 1500;
let timerId = null;

function updateTimer() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  document.querySelector('.timer-display').textContent = 
    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

document.getElementById('start-timer').addEventListener('click', function() {
  if (timerId === null) {
    timerId = setInterval(() => {
      timeLeft--;
      updateTimer();
      if (timeLeft === 0) {
        clearInterval(timerId);
        timerId = null;
        alert('Time is up!');
      }
    }, 1000);
    this.textContent = 'Pause';
  } else {
    clearInterval(timerId);
    timerId = null;
    this.textContent = 'Start';
  }
});

document.getElementById('reset-timer').addEventListener('click', () => {
  clearInterval(timerId);
  timerId = null;
  timeLeft = 1500;
  updateTimer();
  document.getElementById('start-timer').textContent = 'Start';
});

const calcDisplay = document.getElementById('calc-display');
let currentCalc = '';

document.querySelector('.calc-buttons').addEventListener('click', e => {
  if (e.target.tagName === 'BUTTON') {
    const value = e.target.textContent;
    
    if (value === '=') {
      try {
        currentCalc = eval(currentCalc.replace('×', '*').replace('÷', '/')).toString();
        calcDisplay.value = currentCalc;
      } catch (err) {
        calcDisplay.value = 'Error';
        currentCalc = '';
      }
    } else if (value === 'C') {
      currentCalc = '';
      calcDisplay.value = '';
    } else {
      currentCalc += value;
      calcDisplay.value = currentCalc;
    }
  }
});

document.getElementById('save-notes').addEventListener('click', () => {
  const notes = document.getElementById('notes-area').value;
  chrome.storage.local.set({ 'studentNotes': notes }, () => {
    alert('Notes saved!');
  });
});

chrome.storage.local.get(['studentNotes'], result => {
  if (result.studentNotes) {
    document.getElementById('notes-area').value = result.studentNotes;
  }
});

const conversions = {
  length: {
    units: ['meters', 'kilometers', 'miles', 'feet'],
    rates: {
      meters: 1,
      kilometers: 0.001,
      miles: 0.000621371,
      feet: 3.28084
    }
  },
  mass: {
    units: ['grams', 'kilograms', 'pounds', 'ounces'],
    rates: {
      grams: 1,
      kilograms: 0.001,
      pounds: 0.00220462,
      ounces: 0.035274
    }
  },
  temperature: {
    units: ['Celsius', 'Fahrenheit', 'Kelvin'],
    convert: (value, from, to) => {
      let celsius;
      if (from === 'Celsius') celsius = value;
      else if (from === 'Fahrenheit') celsius = (value - 32) * 5/9;
      else if (from === 'Kelvin') celsius = value - 273.15;
      
      if (to === 'Celsius') return celsius;
      else if (to === 'Fahrenheit') return celsius * 9/5 + 32;
      else if (to === 'Kelvin') return celsius + 273.15;
    }
  }
};

function updateUnitSelects() {
  const type = document.getElementById('conversion-type').value;
  const fromSelect = document.getElementById('from-unit');
  const toSelect = document.getElementById('to-unit');
  
  fromSelect.innerHTML = '';
  toSelect.innerHTML = '';
  
  conversions[type].units.forEach(unit => {
    fromSelect.add(new Option(unit, unit));
    toSelect.add(new Option(unit, unit));
  });
}

document.getElementById('conversion-type').addEventListener('change', updateUnitSelects);
updateUnitSelects();

document.getElementById('convert-input').addEventListener('input', () => {
  const type = document.getElementById('conversion-type').value;
  const value = parseFloat(document.getElementById('convert-input').value);
  const from = document.getElementById('from-unit').value;
  const to = document.getElementById('to-unit').value;
  
  if (isNaN(value)) {
    document.getElementById('conversion-result').textContent = '';
    return;
  }
  
  let result;
  if (type === 'temperature') {
    result = conversions.temperature.convert(value, from, to);
  } else {
    const toBase = value / conversions[type].rates[from];
    result = toBase * conversions[type].rates[to];
  }
  
  document.getElementById('conversion-result').textContent = 
    `${value} ${from} = ${result.toFixed(2)} ${to}`;
});
