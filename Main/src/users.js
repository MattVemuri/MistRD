// THIS FILE HANDLES THE USERS PAGE
// All code hand authored except for those labeled otherwise

// get confirm add button
const confirmAdd = document.getElementById('confirm-add')
if(confirmAdd){
    // add click listener
    confirmAdd.addEventListener('click',()=>{
        // stop click from going through
        event.preventDefault()
        event.stopPropagation()
        // get parent add box
        const item = confirmAdd.closest('.add-form')
        // get inputs
        let inputs = fetchInputs(item)
        // verify inputs are valid
        if(verifyUserInput(inputs)){
            // post new user to db
            fetch('/users/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: inputs[0],
                })
            }).then(()=>{
                // refresh
                window.location.reload()
            })
        }else{
            // refresh
            window.location.reload()
        }
    })
}

// get edit buttons
const editBtns = document.querySelectorAll(".edit");
if(editBtns){
    // loop through all
    editBtns.forEach(editBtn =>{
        // add a click event to edit buttons
        editBtn.addEventListener('click',(event)=>{
            // stop from going through
            event.preventDefault()
            event.stopPropagation()
            // select parent item
            const item = editBtn.closest('.item')
            item.classList.toggle('editing')
            // if its in edit mode
            if(item.classList.contains('editing')){
                // stop from being link
                item.dataset.href = item.href;
                item.removeAttribute('href')
                // convert to editable fields
                editUser(item)
            }else{
                // restore link
                item.href = item.dataset.href
                // grab inputes
                let inputs = fetchInputs(item)
                if(verifyUserInput(inputs)){
                    // fetch id
                    let id = item.querySelector('.item-id').textContent.trim()
                    // post updated user to db
                    fetch('/users/modify', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            id,
                            username: inputs[0],
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

// convert labels to editable fields
function editUser(item){
    // replace title
    const title = item.querySelector('.item-title');
    let currentText = title.textContent.trim();
    // construct input field
    const input = document.createElement("input");
    input.type = "text"
    // set value to current value
    input.value = currentText
    input.classList.add("edit-input")
    // replace
    title.replaceWith(input)
}

// get inputs
function fetchInputs(item){
    // get inputs from passed item, either in edit mode or the add box
    const inputs = item.querySelectorAll('.edit-input, .add-box');
    // init array
    var inputsArr =[]
    // loop through each input
    inputs.forEach(field => {
        // get current value
        let currentText = field.value.trim();
        // push to array
        inputsArr.push(currentText)
    })
    // return list of inputs
    return inputsArr
}

// verify inputs are good
function verifyUserInput(inputs){
    // [Username]
    // username can't be empty
    if(inputs[0]==''){
        alert('Username may not be left empty')
        return false;
    }
    return true
}
