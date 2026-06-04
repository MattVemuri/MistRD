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
