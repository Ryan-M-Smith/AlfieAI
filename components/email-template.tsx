//
// Filename: pages.tsx
// Description: Resend email template for contact form submissions
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import { JSX } from "react";

interface EmailTemplateProps {
	name: string;
	email: string;
	subject: string;
	message: string;
}

export default function EmailTemplate({ name, email, subject, message }: EmailTemplateProps): JSX.Element {
	return (
		<div>
			<h1>Contact Form Submission</h1>
			<p><strong>Name:</strong> {name}</p>
			<p><strong>Email:</strong> {email}</p>
			<p><strong>Subject:</strong> {subject}</p>
			<p><strong>Message:</strong></p>
			<p>{message}</p>
		</div>
	);
}