const addBtn = document.querySelector(".add");
if(addBtn){
    addBtn.addEventListener("click", (event) => {
        event.preventDefault()
        event.stopPropagation()
        const form = document.querySelector(".add-form")
        if(form){
            form.classList.toggle('hidden')
        }
    });
}

const deleteBtns = document.querySelectorAll(".delete");
if(deleteBtns){
    deleteBtns.forEach(deleteBtn=>{
        deleteBtn.type = 'button'
        deleteBtn.addEventListener('click',(event)=>{
            // const item = deleteBtn.closest('.item')
            // item.removeAttribute('href')
            
            event.preventDefault()
            event.stopPropagation()
            // event.stopImmediatePropagation();
            // alert('aaa')
            deleteBtn.closest('form').requestSubmit()
        })
    })
}