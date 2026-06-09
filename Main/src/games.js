// THIS FILE HANDLES THE GAMES PAGE
// All code hand authored except for those labeled otherwise

// get confirm add button
const confirmAdd = document.getElementById('confirm-add')
if(confirmAdd){
    // add click event to confirm add button
    confirmAdd.addEventListener('click',()=>{
        // stop click from continuing
        event.preventDefault()
        event.stopPropagation()
        // grab parent add form
        const item = confirmAdd.closest('.add-form')
        // get inputs
        let inputs = fetchInputs(item)
        // are inputs valid?
        if(verifyGamesInput(inputs)){
            // add new game to db
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
                // refresh page
                window.location.reload()
            })
        }
    })
}

// get all edit buttons
const editBtns = document.querySelectorAll(".edit");
if(editBtns){
    // loop through all buttons
    editBtns.forEach(editBtn =>{
        // add a click event to edit buttons
        editBtn.addEventListener('click',(event)=>{
            // stop from going through
            event.preventDefault()
            event.stopPropagation()
            // select parent item
            const item = editBtn.closest('.item')
            item.classList.toggle('editing')
            // if in edit mode
            if(item.classList.contains('editing')){
                // stop from being link
                item.dataset.href = item.href;
                item.removeAttribute('href')

                // convert to editable fields
                editGame(item)
            }else{
                // restore link
                item.href = item.dataset.href
                // grab inputs
                let inputs = fetchInputs(item)
                if(verifyGamesInput(inputs)){
                    let id = item.querySelector('.item-id').textContent.trim()
                    // modify game in db
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
                            playtime: inputs[6]
                        })
                    }).then(()=>{
                        // refresh page
                        window.location.reload()
                    })
                }else{
                    // refresh page if inputs were invalid
                    window.location.reload()
                }
            }
        })
    })
}

// convert labels to editable fields
function editGame(item){
    // get all labels
    const fields = item.querySelectorAll('.label-content');
    // loop through them
    fields.forEach(field => {
        // get label which identifies them
        const label = field.closest('.info-box').querySelector('.label').textContent.trim()
        
        // copies sold is calculated, not directly modifiable
        if(label=='Copies Sold'){
            return;
        }
        // grab current value of field
        let currentText = field.textContent.trim();
        // strip price of $
        if(label=='Price'){
            currentText = currentText.replaceAll('$','')
        }

        // release date should be date input
        if(label=='Release Date'){
            // construct a date input element
            const input = document.createElement("input");
            input.type = "date";
            input.classList.add("edit-input")
            // split by - from MM-DD-YYYY input
            date = currentText.split('-')
            // set current value to current date
            // padStart copied from stack overflow
            // 6/5/26
            // https://stackoverflow.com/questions/61830788/setting-date-in-html-date-input-using-javascript
            input.value = `${date[2]}-${date[0].padStart(2,'0')}-${date[1].padStart(2,'0')}`
            // replace field with input
            field.replaceWith(input)
            return
        }

        // publisher should be dropdown
        if(label=='Publisher'){
            // copy dropdown from add form, clone as not to steal it
            const input = document.getElementById('publisher-dropdown').cloneNode(true)
            input.classList = 'edit-input'
            // remove id so further edits don't get confused
            input.removeAttribute('id')
            // check each option
            for(option of input.options){
                //  match against current text to find which is currently selected
                if(option.text.trim()==currentText){
                    // update index
                    input.selectedIndex = option.index
                    break;
                }
            }
            // replace label with input field
            field.replaceWith(input)
            return
        }

        // genre should be dropdown
        if(label=='Genre'){
            // copy dropdown from add form, clone as not to steal it
            const input = document.getElementById('genre-dropdown').cloneNode(true)
            input.classList = 'edit-input'
            // remove id so further edits don't get confused
            input.removeAttribute('id')
            // check each option
            for(option of input.options){
                //  match against current text to find which is currently selected
                if(option.text.trim()==currentText){
                    // update index
                    input.selectedIndex = option.index
                    break;
                }
            }
            // replace label with input field
            field.replaceWith(input)
            return
        }

        // replace with text input field
        const input = document.createElement("input");
        input.type = "text"
        // set current value to current text
        input.value = currentText
        input.classList.add("edit-input")
        field.replaceWith(input)
    })

    // replace title
    const title = item.querySelector('.item-title');
    let currentText = title.textContent.trim();
    // replace with text input containing current title
    const input = document.createElement("input");
    input.type = "text"
    input.value = currentText
    input.classList.add("edit-input")
    title.replaceWith(input)

}

// grab inputs
function fetchInputs(item){
    // get inputs from passed item, either in edit mode or the add box
    const inputs = item.querySelectorAll('.edit-input, .add-box');
    // initialize array
    var inputsArr =[]
    // for each input
    inputs.forEach(field => {
        // grab current text value
        let currentText = field.value.trim();
        // if dropdown
        if(currentText == 'all'){
            // get current value
            currentText = field.options[field.selectedIndex].text
        }
        // push to array
        inputsArr.push(currentText)
    })
    // return list of inputs
    return inputsArr
}

// check passed inputs
function verifyGamesInput(inputs){
    // [name, publisher, genre, dev, release date, price, playtime]
    // check name
    if(inputs[0]==''){
        alert('Name may not be left empty')
        return false;
    }
    // check publisher
    if(inputs[1]==''){
        alert('Publisher may not be left empty')
        return false;
    }
    // check genre
    if(inputs[2]==''){
        alert('Genre may not be left empty')
        return false;
    }
    // check developer
    if(inputs[3]==''){
        alert('Developer may not be left empty')
        return false
    }
    // check release date
    if(inputs[4]==''){
        alert('Release date may not be left empty')
        return false
    }
    // price is negative
    if(inputs[5] < 0){
        alert('Price may not be negative')
        return false
    }
    // if estimated playtime is in wrong format
    if(inputs[6]!=''&&inputs[6].toLowerCase()!='unknown'){
        const numericPlaytime = Number(inputs[6])
        if(isNaN(numericPlaytime) || numericPlaytime<0){
            alert('Playtime can only be non-negative, left blank, or as \'Unknown\'')
            return false
        }
    }
    // all good!
    return true
}

