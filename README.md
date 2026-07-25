# Footate System

## Background Jobs (Queue Worker)

ভিডিও ডাউনলোড এবং অন্যান্য ব্যাকগ্রাউন্ড কাজগুলো সঠিকভাবে সম্পন্ন করার জন্য লারাভেলের কিউ ওয়ার্কার (Queue Worker) চালু রাখতে হবে। 

### ভিডিও ডাউনলোডের জন্য কিউ রান করা (Run the Queue for Video Downloads)

নিচের কমান্ডটি টার্মিনালে রান করুন:

```bash
php artisan queue:work --queue=video-downloads --sleep=1 --tries=3
```

- `--sleep=1`: কিউতে কোনো কাজ না থাকলে ওয়ার্কার ১ সেকেন্ড অপেক্ষা করবে।
- `--tries=3`: কোনো কাজ (Job) ফেইল করলে এটি সর্বোচ্চ ৩ বার পুনরায় চেষ্টা করবে।

> **Note:** ইনভায়রনমেন্ট ফাইলে (`.env`) অবশ্যই `QUEUE_CONNECTION=database` সেট করা থাকতে হবে।

## অন্যান্য প্রয়োজনীয় কমান্ড (Useful Commands)

**স্টোরেজ লিংক তৈরি করা (Storage Link):**
আপলোড করা বা ডাউনলোড করা ভিডিওগুলো ব্রাউজার থেকে অ্যাক্সেস করার জন্য নিচের কমান্ডটি রান করা আবশ্যক (প্রথমবার প্রজেক্ট সেটআপের সময়):
```bash
php artisan storage:link
```

**অ্যাপ্লিকেশন ক্যাশ ক্লিয়ার করা (Clear Cache):**
```bash
php artisan optimize:clear
```

**ডাটাবেস মাইগ্রেশন রান করা (Run Migrations):**
```bash
php artisan migrate
```
