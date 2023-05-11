import React from 'react'

export default function Message({ color, text, messages, setMessages, index }) {

    const handleClick = () => {
        const copy = [...messages]
        copy.splice(index, 1)
        setMessages(copy)
    }


    return (
        <div class={`alert alert-${color} alert-dismissible fade show`} >
           { text }
            <button type="button" class="btn-close" onClick={handleClick}></button>
        </div>
    )
}
