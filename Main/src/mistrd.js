// THIS FILE HOLDS CODE USED ACROSS ALL PAGES
// (except the homepage)
// All code hand authored except for those labeled otherwise

// gets add new item button
const addBtn = document.querySelector(".add");
if(addBtn){
    // add click event
    addBtn.addEventListener("click", (event) => {
        // stop click from going through
        event.preventDefault()
        event.stopPropagation()
        // get add form
        const form = document.querySelector(".add-form")
        if(form){
            // toggle whether it's hidden or not
            form.classList.toggle('hidden')
        }
    });
}
