const confirmAdd = document.getElementById('confirm-add')
if(confirmAdd){
    confirmAdd.addEventListener('click',()=>{
        event.preventDefault()
        event.stopPropagation()
        const item = confirmAdd.closest('.add-form')
        let inputs = fetchInputs(item)
        // alert(inputs)
        if(verifyUserInput(inputs)){
            fetch('/users/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: inputs[0],
                })
            }).then(()=>{
                window.location.reload()
            })
        }else{
            
            window.location.reload()
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
                editUser(item)
            }else{
                // restore link
                item.href = item.dataset.href
                // grab inputes
                let inputs = fetchInputs(item)
                if(verifyUserInput(inputs)){
                    let id = item.querySelector('.item-id').textContent.trim()
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

function editUser(item){
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
        inputsArr.push(currentText)
    })
    return inputsArr
}

function verifyUserInput(inputs){
    // [Username]
    if(inputs[0]==''){
        alert('Username may not be left empty')
        return false;
    }
    return true
}
