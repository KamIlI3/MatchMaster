export const ShowCountryInfo = (countryName, x, y) => {
    let tooltip = document.getElementById('country-info');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'country-info';
      tooltip.style.position = 'absolute';
      tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'; // Upewnij się, że 'backgroundColor' jest poprawnie zapisane
      tooltip.style.color = '#fff';
      tooltip.style.padding = '5px';
      tooltip.style.borderRadius = '5px';
      document.body.appendChild(tooltip);
    }

    tooltip.innerHTML = countryName;
    tooltip.style.left = `${x + 10}px`; // Ustalanie pozycji
    tooltip.style.top = `${y + 10}px`;
    tooltip.style.display = 'block';
  }

  export const hideCountryInfo = () => {
    const tooltip = document.getElementById('country-info');
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  };