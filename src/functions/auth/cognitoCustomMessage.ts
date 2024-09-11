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
    Acesse: <a href="http://localhost:3000/auth/verify-account/?email=${encodeURIComponent(email)}">https://gamers-pub/auth/verify-account</a> <br/>
    E use o código abaixo para confirmar a sua conta:
    ${code}
    `;
	}

	if (event.triggerSource === 'CustomMessage_ForgotPassword') {
		event.response.emailSubject = 'Recuperação de conta';
		event.response.emailMessage = `<h1>Esqueceu sua senha? </h1>
    <br/>
    <h2>3º passo: Clique no link abaixo e crie sua nova senha.</h2>
    <br/>
    Para recuperar sua conta, acesse o link abaixo e crie sua nova senha: <br/>
    <strong>
    http://localhost:3000/auth/reset-password/?email=${encodeURIComponent(email)}&code=${code}
    </strong>`;
	}

	return event;
}
