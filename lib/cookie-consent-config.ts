//
// Filename: cookie-consent-config.ts
// Description: Configuration for the cookie consent component
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import type { CookieConsentConfig } from "vanilla-cookieconsent";

export const ccConfig: CookieConsentConfig = {
    guiOptions: {
        consentModal: {
            layout: "cloud",
            position: "bottom right",
            equalWeightButtons: true,
            flipButtons: false
        },
        preferencesModal: {
            layout: "box",
            position: "right",
            equalWeightButtons: true,
            flipButtons: false
        },
    },
    categories: {
        necessary: {
            enabled: true,  // This category is enabled by default
            readOnly: true  // This category cannot be disabled
        },
        analytics: {
            autoClear: {
                cookies: [
                    {
                        name: /^_ga/,
                    },
                    {
                        name: "_gid",
                    }
                ]
            },

            // https://cookieconsent.orestbida.com/reference/configuration-reference.html#category-services
            services: {
                ga: {
                    label: "Google Analytics",
                    onAccept: () => {},
                    onReject: () => {}
                }
            }
        },
        ads: {}
    },

    language: {
        default: "en",
        translations: {
            en: {
                consentModal: {
                    title: "We use cookies to improve your experience",
                    description: "AlfieAI uses cookies and similar technologies to enhance your browsing experience, analyze site traffic, and serve personalized content. You can manage your preferences or learn more in our Cookie Policy.",
                    acceptAllBtn: "Accept all",
                    acceptNecessaryBtn: "Reject all",
                    showPreferencesBtn: "Manage individual preferences",
                    footer: `
                        <a href="/policies/cookies" target="_blank">Cookie Policy</a>
                        <a href="/policies/privacy" target="_blank">Privacy Policy</a>
                    `,
                },
                preferencesModal: {
                    title: "Manage your cookie preferences",
                    acceptAllBtn: "Accept all",
                    acceptNecessaryBtn: "Reject all",
                    savePreferencesBtn: "Accept current selection",
                    closeIconLabel: "Close modal",
                    serviceCounterLabel: "Service|Services",
                    sections: [
                        {
                            title: "Your Privacy Choices",
                            description: `You can control how AlfieAI uses cookies and similar technologies. Adjust your preferences below or revisit this panel at any time. To deny consent for specific types of cookies, switch the toggles off or use the 'Reject all' button.`,
                        },
                        {
                            title: "Strictly Necessary",
                            description: "These cookies are essential for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you such as setting your privacy preferences, logging in, or filling in forms.",
                            linkedCategory: "necessary"
                        },
                        {
                            title: "Performance and Analytics",
                            description: "These cookies help us understand how visitors interact with AlfieAI by collecting and reporting information anonymously. This helps us improve the site and your experience.",
                            linkedCategory: "analytics",
                            cookieTable: {
                                caption: "Analytics Cookies",
                                headers: {
                                    name: "Cookie",
                                    domain: "Domain",
                                    desc: "Description"
                                },
                                body: [
                                    {
                                        name: "_ga",
                                        domain: "auto",
                                        desc: "Google Analytics cookie used to distinguish users and track across sessions.",
                                    },
                                    {
                                        name: "_gid",
                                        domain: "auto",
                                        desc: "Google Analytics cookie used to track user behavior within a session.",
                                    }
                                ]
                            }
                        },
                        // {
                        //     title: "Targeting and Advertising",
                        //     description: "These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant ads on other sites. They do not store directly personal information, but are based on uniquely identifying your browser and internet device.",
                        //     linkedCategory: "ads",
                        // },
                        {
                            title: "More information",
                            description: "For any queries about our use of cookies or your choices, please <a href=\"/contact\">contact us</a>."
                        }
                    ]
                }
            }
        }
    }
}