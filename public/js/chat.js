const socket=io()
// Elements

const $messageForm = document.querySelector('#message-form')
const $messageFormInput=$messageForm.querySelector('input')
const $messageFormButton=$messageForm.querySelector('Button')
const $locationButton=document.querySelector('#send-location')
const $messages=document.querySelector('#messages')

// Templates
const messageTemlate=document.querySelector('#message-template').innerHTML
const locationMessageTemplate=document.querySelector('#location-message-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML

// Options
const{username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})
const autoscroll=()=>{
    // New message element

    const $newMessage=$messages.lastElementChild

    // Height of the new message
    const newMessageStyles=getComputedStyle($newMessage)
    const newMessageMargin=parseInt(newMessageStyles.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight+newMessageMargin

    // Visible Height
    const visibleHeight = $messages.offsetHeight

    // Height of message container
    const containerHeight = $messages.scrollHeight

    // How far ahve i scrolled
    const scrollOffset=$messages.scrollTop+visibleHeight
    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop=$messages.scrollHeight
    }
}
socket.on('message',(message)=>{
    console.log(message)
    const html=Mustache.render(messageTemlate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })

    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()

})

socket.on('locationMessage',(message)=>{
    console.log(message)
    const html=Mustache.render(locationMessageTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm a')
    })

    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()


})

socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})

$messageForm.addEventListener('submit',(e)=>{
    
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')

    // const message=document.querySelector('input').value

    const message=e.target.elements.message.value
    socket.emit('sendMessage',message,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        if(error){
            return console.log(error)
        }
        console.log('Message delivered')
    })
})

$locationButton.addEventListener('click',()=>{
    if(!navigator.geolocation)
        return alert('Geolocation is not supported by your browser')
    $locationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        let latitude=position.coords.latitude
        let longitude=position.coords.longitude
        socket.emit('sendLocation',{latitude,longitude},()=>{
            $locationButton.removeAttribute('disabled')
            console.log('Location Shared!')
        })
    })
    

})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})
