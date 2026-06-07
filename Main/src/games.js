const confirmAdd = document.getElementById('confirm-add')
if(confirmAdd){
    confirmAdd.addEventListener('click',()=>{
        event.preventDefault()
        event.stopPropagation()
        const item = confirmAdd.closest('.add-form')
        let inputs = fetchInputs(item)
        // alert(inputs)
        if(verifyGamesInput(inputs)){
            fetch('/games/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: inputs[0],
                    publisher: inputs[1],
                    genre: inputs[2],
                    developer: inputs[3],
                    release: inputs[4],
                    price: inputs[5],
                    playtime: inputs[6]
                })
            }).then(()=>{
                window.location.reload()
            })
        }
    })
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
                let inputs = fetchInputs(item)
                if(verifyGamesInput(inputs)){
                    let id = item.querySelector('.item-id').textContent.trim()
                    // console.log(inputs)
                    fetch('/games/modify', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            id,
                            name: inputs[0],
                            publisher: inputs[1],
                            genre: inputs[2],
                            developer: inputs[3],
                            release: inputs[4],
                            price: inputs[5],
                            playtime: inputs[5]
                        })
                    }).then(()=>{
                        window.location.reload()
                    })
                }else{
                    // alert('An input was misconfigured')
                    window.location.reload()
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

        let currentText = field.textContent.trim();
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

        if(label=='Publisher'){
            const input = document.getElementById('publisher-dropdown').cloneNode(true)
            input.classList = 'edit-input'
            input.removeAttribute('id')
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
    // replace title
    const title = item.querySelector('.item-title');
    let currentText = title.textContent.trim();
    const input = document.createElement("input");
    input.type = "text"
    input.value = currentText
    input.classList.add("edit-input")
    title.replaceWith(input)

}

function fetchInputs(item){
    const inputs = item.querySelectorAll('.edit-input, .add-box');
    var inputsArr =[]
    inputs.forEach(field => {
        let currentText = field.value.trim();
        if(currentText == 'all'){
            currentText = field.options[field.selectedIndex].text
        }
        inputsArr.push(currentText)
    })
    return inputsArr
}

function verifyGamesInput(inputs){
    // alert(inputs)
    // [name, publisher, genre, dev, release date, price, playtime]
    if(inputs[0]==''){
        alert('Name may not be left empty')
        return false;
    }
    if(inputs[1]==''){
        alert('Publisher may not be left empty')
        return false;
    }
    if(inputs[2]==''){
        alert('Genre may not be left empty')
        return false;
    }
    if(inputs[3]==''){
        alert('Developer may not be left empty')
        return false
    }
    if(inputs[4]==''){
        alert('Release date may not be left empty')
        return false
    }
     // price is negative
    if(inputs[5] < 0){
        alert('Price may not be negative')
        return false
    }
    if(inputs[6]!=''){
        if(inputs[5]<0){
            alert('Playtime can only be non-negative, left blank, or as \'Unknown\'')
            return false
        }
    }
    return true
}

