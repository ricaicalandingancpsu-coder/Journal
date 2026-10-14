<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>{{ config('app.name', 'Dear Diary') }}</title>
        <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27%3E%3Crect width=%2732%27 height=%2732%27 rx=%278%27 fill=%27%23924e5a%27/%3E%3C/svg%3E">
        <meta name="description" content="A private digital diary for daily entries, photo memories and moods.">

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=Hanken+Grotesk:wght@400;500;600&display=swap" rel="stylesheet">

        @viteReactRefresh
        @vite(['resources/js/app.jsx'])
    </head>
    <body>
        <div id="root"></div>
        <noscript>Dear Diary needs JavaScript to run.</noscript>
    </body>
</html>
