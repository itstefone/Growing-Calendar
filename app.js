document.querySelector("#zip-code-btn").addEventListener("click", findZone);
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
function findZone(e) {
  const zipcode = document.querySelector("#zip-code").value;
  fetch("zipcode.json")
    .then((response) => response.json())
    .then((data) => {
      const foundFromJSON = data.filter((item) => {
        return item.zipcode == zipcode;
      });
      setZipCodeToLocalStorage(foundFromJSON.length ? foundFromJSON[0] : null);
    });
}
function setZipCodeToLocalStorage(data) {
  if (!data) {
    alert("bad zip code!");
    return;
  }
  const categoriesTypeContainer = document.querySelector(
    "#categories-types-container"
  );
  categoriesTypeContainer.style.display = "inline-block";
  const categoriesLink = document.querySelector("#categories-links");
  categoriesLink.style.display = "block";
  localStorage.setItem("zipcode", JSON.stringify(data));
  location.reload();
}
function setIfExistZipCodeInLocalStorage() {
  localStorage.removeItem('items');
  const zipCode = JSON.parse(localStorage.getItem("zipcode"));
  if (!zipCode) {
    const categoriesTypeContainer = document.querySelector(
      "#categories-types-container"
    );
    categoriesTypeContainer.style.display = "none";
    const categoriesLink = document.querySelector("#categories-links");
    categoriesLink.style.display = "none";
    return;
  }
  writeZipCode(zipCode);
}
function writeZipCode(zipcode) {
  const zipCodeData = document.querySelector("#zip-code-data");
  zipCodeData.innerHTML = `
 <ul>
 <li>zipcode: ${zipcode.zipcode}</li>
 <li>zone: ${zipcode.zone}</li>
 </ul>
  `;


}
function getAllCategories() {
  fetch("grow-calendar.json")
    .then((response) => response.json())
    .then((data) => {
      let categories = data.map((item) => item.category);
      categories = [...new Set(categories)];
      displayCategories(categories);
      displayCategoriesTypes(categories);
    });
}

function displayCategories(categories) {
  const categoriesContainer = document.querySelector("#categories-links");
  let output = "";
  categories.forEach((category, index) => {
    const dataCategory = category.replace(/\s/g, "-");
    category = category.replace(/AND/g, '&');
    output += `
        <a href="#" class="category-link ${
          index == 0 ? "category-active" : ""
        }" data-category=${dataCategory}>${category}</>
    `;
  });
  categoriesContainer.innerHTML = output;
}

function displayCategoriesTypes(categories) {
  const categoriesTypesContainer = document.querySelector(
    "#categories-types-container"
  );
  fetchDataFromGrowCalendar().then((data) => {
    categories.forEach((category, index) => {
      const categoryTypeId = category.replace(/\s/g, "-").toLowerCase();
      const categoryTypes = data.filter((item) => item.category == category);
      let output = `
      <div class='category-type ${
        index == 0 ? "category-type-active" : ""
      }'   id='${categoryTypeId}-types'>`;


      const categoryName = category.toLowerCase().replace(/and/g, '&');

      output += `
      <div class='category-type-items-description'>
      <h3>Choose from list below</h3>
      <a href="#" class="viewAll">View All ${categoryName} </a>
       
    </div>
      <div class='category-type-items'>
      `;
      categoryTypes.forEach((item) => {
        const itemType = item.type.replace(/\s/g, "-").toLowerCase();
        output += `<div class='category-type-item' > <input type="checkbox" class="checkbox-type" data-type=${itemType}> ${item.type} </div>`;
      });
      output += `</div>
      
      <div class="filter-options">
      <a href="#" class="clearAll" >Clear All ${categoryName}</a>
     </div>
      </div>
      </div>`;
      categoriesTypesContainer.innerHTML += output;
    });
  });
}
function fetchDataFromGrowCalendar() {
  return fetch("grow-calendar.json")
    .then((response) => response.json())
    .then((data) => {
      return data;
    });
}

document.querySelector("#categories-links").addEventListener("click", (e) => {
  if (e.target.className.includes("category-link")) {
    changeActiveContainer(e);
  }
});
function changeActiveContainer(e) {
  e.preventDefault();
  const categoryLinks = document.querySelectorAll(".category-link");
  const categoryTypes = document.querySelectorAll(".category-type");
  const categoryTypeId =
    "#" + e.target.dataset.category.toLowerCase() + "-types";
  categoryLinks.forEach((categoryLink) => {
    categoryLink.classList.remove("category-active");
  });
  categoryTypes.forEach((categoryType) => {
    categoryType.classList.remove("category-type-active");
  });
  e.target.classList.add("category-active");
  document.querySelector(categoryTypeId).classList.add("category-type-active");
}

document
  .querySelector("#categories-types-container")
  .addEventListener("click", (e) => {
  
    if (e.target.className.includes("checkbox-type")) {

      let item = e.target.dataset.type;

      let items = JSON.parse(localStorage.getItem('items')) || [];


      if(e.target.checked){
          items.push(item);
          localStorage.setItem('items', JSON.stringify(items));
      } else {
        items =  items.filter(i => {
              return i.indexOf(item) == -1;
        });
        localStorage.setItem('items', JSON.stringify(items));
      }
      displayCheckedInput(items);
    }



    if (e.target.className.includes("clearAll")) {
     const checkboxes =  e.path[2].querySelectorAll('.checkbox-type'); 
     checkboxes.forEach(item => {
         if(item.checked) {
           item.click();
         }
     });
    }



    if (e.target.className.includes("viewAll")) {
      const checkboxes =  e.path[2].querySelectorAll('.checkbox-type'); 
      checkboxes.forEach(item => {
          if(!item.checked) {
            item.click();
          }
      });
     }


  });

function displayCheckedInput(items) {
 
  const categoryTypeCheckedInput = document.querySelectorAll(
    ".checkbox-type:checked"
  );
  const categoryTypeValue = items;
  fetchDataFromGrowCalendar().then((data) => {

    let filteredData = [];
    categoryTypeValue.forEach(cty => {
              data.forEach(item => {
              const itemType = item.type.replace(/\s/g, "-").toLowerCase();
               if(cty.toLowerCase().indexOf(itemType.toLowerCase()) !== -1) {
                 filteredData.push(item);
               } 

            });
    });
    displayResult(filteredData);
  });
}
function displayResult(data) {
  const zipCode = JSON.parse(localStorage.getItem("zipcode"));
  const zone = zipCode.zone;
  const resultContainer = document.querySelector("#resultContainer");
  resultContainer.innerHTML = "";
  data.forEach((item, index) => {
    let output = "";
    let itemSpringIndoor = null
    if(item.spring_indoor) {
       itemSpringIndoor = item.spring_indoor.filter((indoor) => {
        return indoor.zone.indexOf(zone) !== -1;
  });
    } else {
       itemSpringIndoor = [];
    }
      let itemSpringTransplant = null;
    if(item.spring_transplant) {
       itemSpringTransplant = item.spring_transplant.filter((transplant) => {
        return transplant.zone.indexOf(zone) !== -1;
      });
    } else {
       itemSpringTransplant = [];
    }
    
      let itemSpringDirect = null;
    if(item.spring_direct) {
       itemSpringDirect = item.spring_direct.filter((direct) => {
        return direct.zone.indexOf(zone) !== -1;
      });
    } else {
       itemSpringDirect = [];
    }
    
    output += `<div class='result-item'>
    <div class='image-container'>
      <div>
      <p class='image-title'>${item.type} </p> 
      <img src='./images/${item.image}' />
      </div>
      </div>
      `;
    output += `
    <div class='left-side'>
    <div class='legends'>
    `;
      output+=` <div class='legend '>
      <div class="legend-title">
      <span class="legend-icon legend-indoor"></span>
       <span>Start seeds  indoors</span>
       </div> `;
       if(itemSpringIndoor.length > 0) {
       output+= `<div class="legend-info">`;
       itemSpringIndoor.forEach((item, index) => {
           let startDate = item.startDate.replace(/-/g, ' ');
           let endDate = item.endDate.replace(/-/g, ' ');
           output+= `${startDate} - ${endDate}`;    
              if(index != itemSpringIndoor.length - 1) {
                output+= `, `;
              }

       });
      output+= `</div>`;
         } 
     output+=`</div>`;
 

   
      output+= `<div class='legend'>
      <div class="legend-title">
      <span class="legend-icon legend-transplant"></span>
       <span>Transplant outdoors</span>
       </div>`;
       
       if(itemSpringTransplant.length > 0) {
      output+= `<div class="legend-info">`;
      itemSpringTransplant.forEach((item, index) => {
          let startDate = item.startDate.replace(/-/g, ' ');
          let endDate = item.endDate.replace(/-/g, ' ');
          output+= `${startDate} - ${endDate}`;

          if(index != itemSpringTransplant.length - 1) {
            output+= `, `;
          }
      });
     output+= `</div>
      `;
    } 
       output += `</div>`;
 



      output+=`  <div class='legend'>
       <div class="legend-title">
       <span class="legend-icon legend-direct"></span>
        <span>Plant seeds outdoors</span>
        </div>`;
        if(itemSpringDirect.length > 0) {
        output+= `<div class="legend-info">`;
        itemSpringDirect.forEach((item, index) => {
            let startDate = item.startDate.replace(/-/g, ' ');
            let endDate = item.endDate.replace(/-/g, ' ');
            output+= `${startDate} - ${endDate}`;
            if(index != itemSpringDirect.length - 1) {
              output+= `, `;
            }
        });
       output+= `</div>`;
      } 
      output+= `</div>`;
       
  
    output+=`
    </div>
    <div class='months'>
    `;
    months.forEach((month) => {
      output += `<div class='month ${month + index}'>
            <div class='month-container'>
            <p class='month-title'>${month}</p>
            </div>
           
          </div>`;
    });
    output += `
    </div>
    </div>
    </div>
    `;
    resultContainer.innerHTML += output;
    displayPeriod(itemSpringIndoor, "spring-indoor", index);
    displayPeriod(itemSpringTransplant, "spring-transplant",index);
    displayPeriod(itemSpringDirect, "spring-direct",index);
  });
}
function displayPeriod(periodData, type, indexMonth) {
  if (!periodData.length) return;
  periodData.forEach((item, index) => {
    const startDay = item.startDate.split("-")[0];
    const startMonth = item.startDate.split("-")[1];
    const endDay = item.endDate.split("-")[0];
    const endMonth = item.endDate.split("-")[1];
    const indexStartMonth = months.indexOf(startMonth);
    const indexEndMonth = months.indexOf(endMonth);
    const fullDate = `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
    if (indexStartMonth == indexEndMonth) {
      const monthContainer = document.querySelector(
        "." + startMonth + indexMonth + " > .month-container"
      );
      const startPosition = (startDay / 31) * 100;
      const width = ((endDay - startDay) / 31) * 100;
      let output = `<div data-tooltip="${fullDate}" style="left:${startPosition}%; width:${width}%" class='${type}'></div>`;
      monthContainer.innerHTML += output;
    } else if (indexStartMonth < indexEndMonth) {
      if (indexEndMonth - indexStartMonth == 1) {
        const startMonthContainer = document.querySelector(
          "." + startMonth + indexMonth + " > .month-container"
        );
        const endMonthContainer = document.querySelector(
          "." + endMonth + indexMonth + " > .month-container"
        );

        const startPosition = (startDay / 31) * 100;
        const widthStartMonth = ((31 - startDay) / 31) * 100;
        startMonthContainer.innerHTML += `<div data-tooltip="${fullDate}" style="left:${startPosition}%;width:${widthStartMonth}%" class="${type}"></div>`;
        const widthEndMonth = (endDay / 31) * 100;
        endMonthContainer.innerHTML += `<div data-tooltip="${fullDate}" style="left:0%; width:${widthEndMonth}%" class="${type}"></div>`;
      } else {
        const startMonthContainer = document.querySelector(
          "." + startMonth + indexMonth + " > .month-container"
        );
        const endMonthContainer = document.querySelector(
          "." + endMonth + indexMonth + " > .month-container"
        );
        const startPosition = (startDay / 31) * 100;
        const widthStartMonth = ((31 - startDay) / 31) * 100;

        const widthEndMonth = (endDay / 31) * 100;
        startMonthContainer.innerHTML += `<div data-tooltip="${fullDate}" style="left:${startPosition}%;width:${widthStartMonth}%" class="${type}"></div>`;
        endMonthContainer.innerHTML += `<div data-tooltip="${fullDate}" style="left:0%;width:${widthEndMonth}%" class="${type}"></div>`;
        const monthsBetween = months.slice(indexStartMonth + 1, indexEndMonth);
        monthsBetween.forEach((month) => {
          const monthContainer = document.querySelector(
            "." + month + indexMonth + " > .month-container"
          );
          monthContainer.innerHTML += `<div data-tooltip="${fullDate}" style='left:0%;width:100%' class="${type}"></div>`;
        });
      }
    } else if (indexStartMonth > indexEndMonth) {
      const startMonthContainer = document.querySelector(
        "." + startMonth + indexMonth + " > .month-container"
      );
      const endMonthContainer = document.querySelector(
        "." + endMonth + indexMonth + " > .month-container"
      );
        const startPosition = (startDay / 31) * 100;
        const widthStartMonth = ((31 - startDay) / 31) * 100;
        startMonthContainer.innerHTML += `<div data-tooltip="${fullDate}" style="left:${startPosition}%;width:${widthStartMonth}%" class="${type}"></div>`;
        const widthEndMonth = (endDay / 31) * 100;
        endMonthContainer.innerHTML += `<div data-tooltip="${fullDate}" style="left:0%; width:${widthEndMonth}%" class="${type}"></div>`;
      const monthsUntilTheEndOfYear = months.slice(indexStartMonth + 1);
      monthsUntilTheEndOfYear.forEach((month) => {
        const monthContainer = document.querySelector(
          "." + month + indexMonth + " > .month-container"
        );
        monthContainer.innerHTML += `<div data-tooltip="${fullDate}" style='left:0%;width:100%' class="${type}"></div>`;
      });

      const monthsToTheEnd = months.slice(0, indexEndMonth);


      monthsToTheEnd.forEach((month) => {
        const monthContainer = document.querySelector(
          "." + month + indexMonth + " > .month-container"
        );
        monthContainer.innerHTML += `<div data-tooltip="${fullDate}" style='left:0%;width:100%' class="${type}"></div>`;
      });
      
      
    }
  });
}
getAllCategories();
setIfExistZipCodeInLocalStorage();

document
  .querySelector("#resultContainer")
  .addEventListener("mousemove", (e) => {
    if (
      e.target.className.includes("spring-indoor") ||
      e.target.className.includes("spring-transplant") ||
      e.target.className.includes("spring-direct")
    ) {
      displayTooltip(e);
    } else {
      const tooltip = document.querySelector("#tooltip");
      tooltip.style.display = "none";
    }
  });

function displayTooltip(e) {
  const dateText = e.target.dataset.tooltip;

  const tooltip = document.querySelector("#tooltip");
  tooltip.innerHTML = dateText;
  tooltip.style.display = "block";
  tooltip.style.top = e.pageY + 8 + "px";
  tooltip.style.left = e.pageX + "px";
}


document.querySelector('#printer').addEventListener('click', () => {
  const zip = JSON.parse(localStorage.getItem('zipcode'));
  const headerZone = document.querySelector('.header-zone');
  headerZone.innerHTML =`Zone ${zip.zone}`;
  window.print();
});