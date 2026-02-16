<?php

namespace App\Http\Controllers;

class WebsiteController extends Controller
{
    public function home()
    {
        return view('website.home');
    }

    public function about()
    {
        return view('website.about');
    }

    public function shareideFleet()
    {
        return view('website.shareide-fleet');
    }

    public function shareideApp()
    {
        return view('website.shareide-app');
    }

    public function howItWorks()
    {
        return view('website.how-it-works');
    }

    public function safety()
    {
        return view('website.safety');
    }

    public function download()
    {
        return view('website.download');
    }

    public function carpool()
    {
        return view('website.carpool');
    }

    public function loyalty()
    {
        return view('website.loyalty');
    }

    public function driveWithUs()
    {
        return view('website.drive-with-us');
    }

    public function cities()
    {
        return view('website.cities');
    }

    public function faq()
    {
        return view('website.faq');
    }

    public function support()
    {
        return view('website.support');
    }

    public function blog()
    {
        return view('website.blog');
    }

    public function privacy()
    {
        return view('website.privacy');
    }

    public function terms()
    {
        return view('website.terms');
    }

    public function refund()
    {
        return view('website.refund');
    }
}
