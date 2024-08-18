import { CustomMessageTriggerEvent } from 'aws-lambda';

export async function handler(event: CustomMessageTriggerEvent) {
	const name = event.request.userAttributes.given_name;
	const code = event.request.codeParameter;
	const email = event.request.userAttributes.email;

	if (event.triggerSource === 'CustomMessage_SignUp') {
		event.response.emailSubject = `Bem vindo(a) ${name}`;
		event.response.emailMessage = `<h1> Seja muito bem-vindo(a) ${name} ao Gamers' Pub!</h1>
    <br/> <br/>
    Esperamos que você aproveite sua passagem por aqui!
    <br/> <br/>
    Para confirmar a sua conta: <br/>
    acesse: (inserir link depois) <br/>
    E use este código para confirmar a sua conta:
    ${code}
    `;
	}

	if (event.triggerSource === 'CustomMessage_ForgotPassword') {
		event.response.emailSubject = 'Recuperação de conta';
		event.response.emailMessage = `Para recuperar sua conta,
    acesse: <strong>
    http://app.seuapp.com.br/reset/?email=${encodeURIComponent(email)}&code=${code}
    </strong>`;
	}

	return event;
}
