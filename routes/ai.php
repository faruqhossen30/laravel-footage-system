<?php

use App\Mcp\Servers\FootageServer;
use Laravel\Mcp\Facades\Mcp;

Mcp::web('/mcp/footage', FootageServer::class);
Mcp::web('/api/mcp/footage', FootageServer::class);
Mcp::local('footage', FootageServer::class);

