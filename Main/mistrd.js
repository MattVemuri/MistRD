const addBtn = document.querySelector(".add");
if(addBtn){
    addBtn.addEventListener("click", (event) => {
        event.preventDefault()
        event.stopPropagation()
        const form = document.querySelector(".form")
        if(form){
            form.classList.toggle('hidden')
        }
    });
}

const editBtns = document.querySelectorAll(".edit");
if(editBtns){
    editBtns.forEach(editBtn =>{
        // add a click event to edit buttons
        editBtn.addEventListener('click',(event)=>{
            // stop from going through
            event.preventDefault()
            event.stopPropagation()
            // select parent item
            const item = editBtn.closest('.item')
            item.classList.toggle('editing')
            
            if(item.classList.contains('editing')){
                // stop from being link
                item.dataset.href = item.href;
                item.removeAttribute('href')

                // convert to editable fields
                editGame(item)
            }else{
                // restore link
                item.href = item.dataset.href
                // grab inputes
                inputs = fetchInputs(item)
                if(verifyGamesInput(inputs)){
                    id = item.querySelector('.item-id').textContent.trim()
                    console.log(inputs)
                    fetch('/games/modify', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            id,
                            publisher: inputs[0],
                            genre: inputs[1],
                            developer: inputs[2],
                            release: inputs[3],
                            price: inputs[4],
                            playtime: inputs[5]
                        })
                    })
                }else{
                    alert('An input was misconfigured')
                    fetch('/games')
                }
            }
        })
    })
}

function editGame(item){
    const fields = item.querySelectorAll('.label-content');
    fields.forEach(field => {
        const label = field.closest('.info-box').querySelector('.label').textContent.trim()
        // console.log(label)
        // copies sold is calculated, not directly modifiable
        if(label=='Copies Sold'){
            return;
        }

        currentText = field.textContent.trim();
        // strip price of $
        if(label=='Price'){
            currentText = currentText.replaceAll('$','')
        }

        // release date should be date input
        if(label=='Release Date'){
            const input = document.createElement("input");
            input.type = "date";
            input.classList.add("edit-input")

            date = currentText.split('-')
            input.value = `${date[2]}-${date[0].padStart(2,'0')}-${date[1].padStart(2,'0')}`
            field.replaceWith(input)
            return
        }

        // replace with input field
        const input = document.createElement("input");
        input.type = "text"
        input.value = currentText
        input.classList.add("edit-input")

        field.replaceWith(input)
    })
}

function fetchInputs(item){
    const inputs = item.querySelectorAll('.edit-input');
    inputsArr =[]
    inputs.forEach(field => {
        const currentText = field.value.trim();
        inputsArr.push(currentText)
    })
    return inputsArr
}

function verifyGamesInput(inputs){
    // [publisher, genre, dev, release date, price, playtime]
    // incorrect input passed
    if(inputs.length != 6){
        return false
    }
    // price is negative
    if(inputs[4] < 0){
        return false
    }
    if(inputs[5]!=''){
        if(inputs[5]<0){
            return false
        }
    }
    if(inputs[1]=='' || inputs[2]=='' || inputs[3]==''){
        return false
    }
    return true
}

