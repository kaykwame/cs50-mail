document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  // By default, load the inbox
  load_mailbox('inbox');
});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}


function send_email() {

  //Get the parameters the user has inputted.
  var recipients = document.querySelector('#compose-recipients').value;
  var subject = document.querySelector('#compose-subject').value;
  var body = document.querySelector('#compose-body').value;

      //Make API POST request to send email
        fetch('/emails', {
          method: 'POST',
          body: JSON.stringify({
            recipients: recipients,
            subject: subject,
            body: body
          })
        })
        .then(response => response.json())
        .then(result => {
          if (result['error']){
            document.querySelector('#em-msge').innerHTML = result['error'];
            document.querySelector('#em-msge').style.color = 'red';
            }
          else {
            load_mailbox('sent');
          }
      })
}



function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#emails-view').value = '';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#button-div').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Get emails
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

  //Loop through emails to obtain individual email and place them in appropriate elements.
  emails.forEach((item) => {
  if(document.body.contains(document.getElementById('email-view'))) {
  var parent_div = document.createElement("div");
	var mailsender = document.createElement('h4');
  var mailrecipient = document.createElement('h4');
	var mailsubject = document.createElement("p");
	var mailtime = document.createElement("p");
	var mailid = document.createElement("p");

  //Set attributes of elements
  parent_div.setAttribute("class", "Container");
  mailtime.setAttribute("id", "t-1");
  mailsubject.setAttribute("id", "t-2");
  mailsender.setAttribute("id", "t-3");
  mailrecipient.setAttribute("id", "t-4");

  //Append created elements with relevant data
	mailsender.appendChild(document.createTextNode(item.sender));
  mailrecipient.appendChild(document.createTextNode(item.recipients));

  //Insert 'No Subject' if email has no subject
	if (item.subject != '') {
            mailsubject.innerHTML = `Subject: ${item.subject}`;
          }
          else {
            mailsubject.innerHTML = 'No Subject';
            mailsubject.style.color = '#ff2e12';
          }
	mailtime.innerHTML = item.timestamp;
  mailtime.style.color = 'white'
  mailid.innerHTML = item.id;

          //hide mailid
          mailid.style.display = 'none';

  //If the email has been read, it should appear with a gray background else it should appear with a white background.
	if (item.read == true) {
            parent_div.style.backgroundColor = '#A9A9A9';
          }
          else {
            parent_div.style.backgroundColor = 'white';
            mailsender.style.color = '#1a1a2e'
            mailsubject.style.color = '#1a1a2e'
            mailtime.style.color = '#1a1a2e'
          }

          //Append elements to parent div to create 'sent' mailbox.
          if ( `${mailbox}` == 'sent') {
            document.querySelector('#emails-view').appendChild(parent_div);
            parent_div.appendChild(mailrecipient);
            parent_div.appendChild(mailsubject);
            parent_div.appendChild(mailtime);
            parent_div.appendChild(mailid);
          }
          else {
            //Append elements to parent div to display 'inbox' or 'archived' mailbox.
            document.querySelector('#emails-view').appendChild(parent_div);
            parent_div.appendChild(mailsender);
            parent_div.appendChild(mailsubject);
            parent_div.appendChild(mailtime);
            parent_div.appendChild(mailid);
          }
          //window.location.reload()
    }
          var mailbody = item.body;
	        //addEventListener to elements to open email contents when clicked
          parent_div.addEventListener('click', () => load_email(mailbox));
          mailsubject.addEventListener('click', () => load_email(mailbox));
          mailtime.addEventListener('click', () => load_email(mailbox));
          mailsender.addEventListener('click', () => load_email(mailbox));
    });
  });
};

function load_email(mailbox) {
  //Prevent further propagation of current event.
  event.stopImmediatePropagation();

  // Show the mailbox and hide other views
  emaildisp = document.querySelector('#email-view');
  emaildisp.style.display = 'block';
  emaildisp.innerHTML = '';
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //Choose parent element in all click instances, get email id and clear email-view contents
  var evnt = event.target;
  if (!(evnt.tagName == 'DIV')) {
    evnt = evnt.parentElement;
  }
  var idnum = evnt.children;
  var id = idnum[3].innerHTML;

  //Make API PUT request to set 'read' boolean value to True.
  fetch(`/emails/${id}`, {
method: 'PUT',
body: JSON.stringify({
    read: true
})
});
  //Make API GET request to get JSON response containing email data.
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      var msndr = email.sender;
      var msub = email.subject;
      var mtime = email.timestamp;
      var mbod = email.body;

	    //Create a div into which the selected (clicked on) email is placed
      var parent_div = document.createElement("div");

		  //Creating elements to be placed in parent_div.
      var mailsubject = document.createElement('h4');
      var mailrecipient = document.createElement('h6');
      var mailsender = document.createElement('h6');
      var mailbody = document.createElement('p');
      var mailtime = document.createElement('p');


      parent_div.setAttribute("class", "container");
      mailsubject.innerText = email.subject;
      mailrecipient.innerText = `To: ${email.recipients}`;
      mailsender.innerText = `From: ${email.sender}`;
      mailbody.innerText = email.body;
      mailbody.style.padding = '35px';
      mailbody.style.backgroundColor = '#C0C0C0';
      mailtime.innerText = email.timestamp;

      if ( `${mailbox}` == 'sent') {
        //Appending elements to parent_div.
        parent_div.appendChild(mailsubject);
        parent_div.appendChild(mailrecipient);
        parent_div.appendChild(mailtime);
        emaildisp.appendChild(parent_div);
        emaildisp.appendChild(mailbody);
        }
      else {
        //Appending elements to parent_div.
        parent_div.appendChild(mailsubject);
        parent_div.appendChild(mailsender);
        parent_div.appendChild(mailtime);
        emaildisp.appendChild(parent_div);
        emaildisp.appendChild(mailbody);
      }

      //To display archive and reply received mails
      if (email.archived == false){
          if ( `${mailbox}` == 'sent') {
            document.querySelector('#button-div').style.display = 'none';
          }
          else {
        document.querySelector('#button-div').style.display = 'block';
        document.querySelector('#unarchive-button').style.display = 'none';
      }
      }
      //To display un-archive button
      if (email.archived != false){
        document.querySelector('#button-div').style.display = 'block';
        document.querySelector('#archive-button').style.display = 'none';
        document.querySelector('#reply-button').style.display = 'none';
      }
      //addEventListener for archive, reply and un-archive buttons.
      document.querySelector('#unarchive-button').addEventListener('click', () => unarchive(`${id}`));
      document.querySelector('#archive-button').addEventListener('click', () => archive(`${id}`));
      document.querySelector('#reply-button').addEventListener('click', () => reply_email(`${id}`, `${msndr}`, `${msub}`, `${mtime}`, `${mbod}`));
  })
  }

function archive(id){
    //Send API PUT request to set boolean 'archived' value to true.
    fetch(`/emails/${id}`, {
  method: 'PUT',
  body: JSON.stringify({
      archived: true
  })
})
load_mailbox('inbox');
//reload the current 'page'
window.location.reload()
}

function unarchive(id){
  //Send API PUT request to set boolean 'archived' value to false.
    fetch(`/emails/${id}`, {
  method: 'PUT',
  body: JSON.stringify({
      archived: false
  })
})
load_mailbox('inbox');
//reload the current 'page'
window.location.reload()
}

function reply_email(id, msndr, msub, mtime, mbod){
  // Show compose view and hide other views
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#button-div').style.display = 'none';

  //Prefill the required fields with the appropriate data
  document.querySelector('#compose-recipients').value = `${msndr}`;;
  document.querySelector('#compose-subject').value = `Re: ${msub}`;
  document.querySelector('#compose-body').value = `\n \n On ${mtime}, ${msndr} wrote: ${mbod}`
}
