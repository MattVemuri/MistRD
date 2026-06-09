// THIS FILE HANDLES THE LIBRARYGAMES & LIBRARY PAGES
// All code hand authored except for those labeled otherwise

// Get confirm add
const confirmAdd = document.getElementById('confirm-add')
if(confirmAdd){
    // add click event handler
    confirmAdd.addEventListener('click',()=>{
        // stop click from going through
        event.preventDefault()
        event.stopPropagation()
        // get add form parent
        const item = confirmAdd.closest('.add-form')
        // grab inputs
        let inputs = fetchInputs(item)
        // verify inputs are correct
        if(verifyLGHeader(inputs.slice(0,2)) && verifyLGInput(inputs.slice(2,4))){
            // add new library game to db
            fetch('/libraryGames/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    game: inputs[0],
                    username: inputs[1],
                    playtime:inputs[2],
                    completion: inputs[3]
                })
            }).then(()=>{
                // reload page
                window.location.reload()
            })
        }else{   
            // reload page
            window.location.reload()
        }
    })
}

// get all edit buttons
const editBtns = document.querySelectorAll(".edit");
if(editBtns){
    // iterate through all buttons
    editBtns.forEach(editBtn =>{
        // add a click event to edit buttons
        editBtn.addEventListener('click',(event)=>{
            // stop from going through
            event.preventDefault()
            event.stopPropagation()
            // select parent item
            const item = editBtn.closest('.item')
            item.classList.toggle('editing')
            // if is in edit mode
            if(item.classList.contains('editing')){
                // stop from being link
                item.dataset.href = item.href;
                item.removeAttribute('href')
                // convert to editable fields
                editLG(item)
            }else{
                // restore link
                item.href = item.dataset.href
                // grab inputs
                let inputs = fetchInputs(item)
                // verify inputs are valid
                if(verifyLGInput(inputs)){
                    // get id
                    let id = item.querySelector('.item-id').textContent.trim()
                    // post updated version to db
                    fetch('/libraryGames/modify', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            id,
                            playtime:inputs[0],
                            completion: inputs[1]
                        })
                    }).then(()=>{
                        // refresh
                        window.location.reload()
                    })
                }else{
                    // refresh
                    window.location.reload()
                }
            }
        })
    })
}

// convert to editable fields
function editLG(item){
    // get all labels
    const fields = item.querySelectorAll('.label-content');
    // iterate through all labels
    fields.forEach(field => {
        // get label which identifies what field is
        const label = field.closest('.info-box').querySelector('.label').textContent.trim()
        // get current value
        let currentText = field.textContent.trim();    

        // strip completion of %
        if(label=='Completion'){
            currentText = currentText.replaceAll('%','')
        }
    
        // replace with input field
        const input = document.createElement("input");
        input.type = "number"
        input.value = currentText
        input.classList.add("edit-input")
        // replace input on DOM
        field.replaceWith(input)
    })
}

// get values of inputs
function fetchInputs(item){
    // get inputs from passed item, either in edit mode or the add box
    const inputs = item.querySelectorAll('.edit-input, .add-box');
    // initialize array
    var inputsArr =[]
    // for each input
    inputs.forEach(field => {
        // get current text value
        let currentText = field.value.trim();
        // if dropdown
        if(currentText == 'all'){
            // get curretn value
            currentText = field.options[field.selectedIndex].text
        }
        // push to array
        inputsArr.push(currentText)
    })
    // return list of inputs
    return inputsArr
}

// verifies editable inputs for library games
function verifyLGInput(inputs){
    // [Playtime, Completion]
    // check playtime is non-negative
    if(inputs[0]<0){
        alert('Playtime may not be negative')
        return false;
    }
    // check completion is from 0-100
    if(inputs[1]<0 || inputs[1]>100){
        alert('Completion must be a value 0-100')
        return false;
    }
    return true
}

// verifies game name and username when adding library game
function verifyLGHeader(inputs){
    // [GameName, Username]
    // game name may not be empty
    if(inputs[0]==''){
        alert('Game may not be empty')
        return false;
    }
    // username may not be empty
    if(inputs[1]==''){
        alert('Username may not be empty')
        return false;
    }
    
    return true;
}
