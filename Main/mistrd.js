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
        editBtn.addEventListener('click',(event)=>{
        event.preventDefault()
        event.stopPropagation()
        const item = editBtn.closest('.item')
        // console.log(item)
        const labels = item.querySelectorAll('.label-content');
        labels.forEach(label => {
            const currentText = label.textContent;

            const input = document.createElement("input");
            input.type = "text";
            input.value = currentText;

            input.classList.add("edit-input");

            label.replaceWith(input);
            })
        })
    })
}

const deleteBtns = document.querySelectorAll(".delete");
if(deleteBtns){
    deleteBtns.forEach(deleteBtn =>{
        deleteBtn.addEventListener('click',(event)=>{
            event.preventDefault()
            event.stopPropagation()
            alert("Pretend this got deleted")
        });
    })
    
}