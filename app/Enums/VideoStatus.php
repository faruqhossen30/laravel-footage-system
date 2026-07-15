<?php

namespace App\Enums;

enum VideoStatus: string
{
    case LIST = 'list';
    case RUN = 'run';
    case DONE = 'done';
}
