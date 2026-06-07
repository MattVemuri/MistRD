const confirmAdd = document.getElementById('confirm-add')
if(confirmAdd){
    confirmAdd.addEventListener('click',()=>{
        event.preventDefault()
        event.stopPropagation()
        const item = confirmAdd.closest('.add-form')
        let inputs = fetchInputs(item)
        // alert(inputs)
        if(verifyLGHeader(inputs.slice(0,2)) && verifyLGInput(inputs.slice(2,4))){
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
                editLG(item)
            }else{
                // restore link
                item.href = item.dataset.href
                // grab inputes
                let inputs = fetchInputs(item)
                if(verifyLGInput(inputs)){
                    let id = item.querySelector('.item-id').textContent.trim()
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
                        window.location.reload()
                    })
                }else{
                    window.location.reload()
                }
            }
        })
    })
}

function editLG(item){

    const fields = item.querySelectorAll('.label-content');
    fields.forEach(field => {
        const label = field.closest('.info-box').querySelector('.label').textContent.trim()
        let currentText = field.textContent.trim();    

        // strip completion of %
        if(label=='Completion'){
            currentText = currentText.replaceAll('%','')
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

function verifyLGInput(inputs){
    // [Username]
    if(inputs[0]<0){
        alert('Playtime may not be negative')
        return false;
    }
    if(inputs[1]<0 || inputs[1]>100){
        alert('Completion must be a value 0-100')
        return false;
    }
    return true
}

function verifyLGHeader(inputs){
    if(inputs[0]==''){
        alert('Game may not be empty')
        return false;
    }
    if(inputs[1]==''){
        alert('Username may not be empty')
        return false;
    }
    
    return true;
}
