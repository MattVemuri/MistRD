const addBtn = document.querySelector(".add");
if(addBtn){
    addBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        const form = document.querySelector(".form")
        if(form){
            const header = form.querySelector('.item-title')
            var text_bit = header.textContent.split(' ')
            text_bit[0] = 'Add'
            header.textContent = text_bit.join(' ')
            form.classList.toggle('hidden')
        }
    });
}

const editBtn = document.getElementById("edit");
if(editBtn){
    editBtn.addEventListener('mousedown',(event)=>{
        event.stopPropagation();
        const form = document.querySelector(".form")
        if(form){
            const header = form.querySelector('.item-title')
            var text_bit = header.textContent.split(' ')
            text_bit[0] = 'Edit'
            header.textContent = text_bit.join(' ')
            form.classList.toggle('hidden')
        }
    });
}

const deleteBtn = document.getElementById("delete");
if(deleteBtn){
    deleteBtn.addEventListener('mousedown',(event)=>{
        event.stopPropagation();
        alert("Pretend this got deleted")
    });
}