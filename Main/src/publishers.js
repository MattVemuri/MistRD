// THIS FILE HANDLES THE PUBLISHERS & SINGLE PUBLISHER PAGES
// All code hand authored except for those labeled otherwise

// get confirm add button
const confirmAdd = document.getElementById('confirm-add')
if(confirmAdd){
    // add click handler
    confirmAdd.addEventListener('click',()=>{
        // stop click from going through
        event.preventDefault()
        event.stopPropagation()
        // get add form
        const item = confirmAdd.closest('.add-form')
        // get inputs
        let inputs = fetchInputs(item)
        // verify if inputs are valid
        if(verifyPublisherInput(inputs)){
            // post new publisher to db
            fetch('/publishers/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: inputs[0],
                    webpage: inputs[1],
                    email: inputs[2],
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
    // iterate through each button
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
                editPublisher(item)
            }else{
                // restore link
                item.href = item.dataset.href
                // grab inputes
                let inputs = fetchInputs(item)
                // if inputs are valid
                if(verifyPublisherInput(inputs)){
                    // grab id
                    let id = item.querySelector('.item-id').textContent.trim()
                    // post updated publisher to db
                    fetch('/publishers/modify', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            id,
                            name: inputs[0],
                            webpage: inputs[1],
                            email: inputs[2],
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
function editPublisher(item){
    // get all labels
    const fields = item.querySelectorAll('.label-content');
    // loop through each
    fields.forEach(field => {
        // get label to identify
        const label = field.closest('.info-box').querySelector('.label').textContent.trim()
        // get current value
        let currentText = field.textContent.trim();
        // create input element
        const input = document.createElement("input");
        input.type = "text"
        // fill with current value
        input.value = currentText
        input.classList.add("edit-input")
        // replace field with new input
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

// get inputs from item
function fetchInputs(item){
    // get inputs from passed item, either in edit mode or the add box
    const inputs = item.querySelectorAll('.edit-input, .add-box');
    // init array
    var inputsArr =[]
    // loop through each input
    inputs.forEach(field => {
        // get current value
        let currentText = field.value.trim();
        // add to array
        inputsArr.push(currentText)
    })
    // return inputs
    return inputsArr
}

// verify inputs are good
function verifyPublisherInput(inputs){
    // [publisher, webpage, email]
    // check publisher
    if(inputs[0]==''){
        alert('Publisher name may not be left empty')
        return false;
    }
    // check webpage
    if(inputs[1]==''){
        alert('Webpage may not be left empty')
        return false;
    }
    // check email
    if(inputs[2]==''){
        alert('Email may not be left empty')
        return false
    }
    return true
}
